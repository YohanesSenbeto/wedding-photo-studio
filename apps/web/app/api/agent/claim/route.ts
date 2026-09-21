import { NextRequest } from "next/server";
import { AgentClaimRequestSchema } from "@wedding/validation";
import type { EditingJob, Photo, Album, AlbumPage, EditingPreset } from "@prisma/client";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agent-auth";
import { buildAgentPayload } from "@/lib/agent-payload";
import { jsonOk, toErrorResponse, ApiError, jsonError } from "@/lib/http";
import { sweepStaleJobs, sweepOfflineAgents } from "@/lib/sweep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JobWithRelations = EditingJob & {
  photo: Photo | null;
  album: (Album & { pages: AlbumPage[] }) | null;
  preset: EditingPreset | null;
};

/**
 * POST /api/agent/claim
 * Atomically hands queued jobs to the authenticated agent.
 * Uses SELECT ... FOR UPDATE SKIP LOCKED so multiple agents never get the
 * same job. Claimed jobs move to CONNECTING; photos move to PROCESSING.
 */
export async function POST(request: NextRequest) {
  try {
    const tokenHash = authenticateAgent(request);
    if (!tokenHash) throw new ApiError("UNAUTHORIZED", "Invalid or missing agent token", 401);

    await sweepStaleJobs(prisma);
    await sweepOfflineAgents(prisma);

    const agent = await prisma.agent.findFirst({ where: { tokenHash } });
    if (!agent) throw new ApiError("NOT_REGISTERED", "Agent must register first", 409);

    const body = AgentClaimRequestSchema.safeParse(await request.json().catch(() => ({})));
    const maxJobs = body.success ? body.data.maxJobs : 1;

    const claimed = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "EditingJob"
        WHERE "status" = 'QUEUED'
        ORDER BY "createdAt" ASC
        LIMIT ${maxJobs}
        FOR UPDATE SKIP LOCKED`;

      const jobs: JobWithRelations[] = [];
      for (const row of rows) {
        const job = await tx.editingJob.update({
          where: { id: row.id },
          data: { status: "CONNECTING", agentId: agent.id },
          include: { photo: true, album: { include: { pages: true } }, preset: true },
        });
        if (job.photoId) {
          await tx.photo.update({
            where: { id: job.photoId },
            data: { status: "PROCESSING" },
          });
        }
        if (job.albumId) {
          await tx.album.update({ where: { id: job.albumId }, data: { status: "PROCESSING" } });
        }
        jobs.push(job);
      }
      return jobs;
    });

    await prisma.agent.update({
      where: { id: agent.id },
      data: { status: claimed.length > 0 ? "BUSY" : "ONLINE", lastSeenAt: new Date() },
    });

    const payloads = claimed.map((job) => {
      try {
        return buildAgentPayload(job);
      } catch (err) {
        // Corrupt job — fail it loudly so the queue is never blocked.
        console.error("[claim] payload build failed for job", job.id, err);
        return null;
      }
    });

    // Fail any job whose payload could not be built.
    for (let i = 0; i < payloads.length; i++) {
      if (payloads[i] === null) {
        await prisma.editingJob.update({
          where: { id: claimed[i].id },
          data: {
            status: "FAILED",
            errorCode: "JOB_CORRUPT",
            errorMessage: "Job payload could not be built",
            completedAt: new Date(),
          },
        });
      }
    }

    return jsonOk({ jobs: payloads.filter((p) => p !== null) });
  } catch (err) {
    if (err instanceof ApiError) return jsonError(err.code, err.message, err.statusCode);
    return toErrorResponse(err);
  }
}
