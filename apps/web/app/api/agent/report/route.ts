import { NextRequest } from "next/server";
import { AgentReportSchema } from "@wedding/validation";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agent-auth";
import { isValidTransition } from "@/lib/jobs";
import { getFriendlyError } from "@wedding/config";
import { jsonOk, toErrorResponse, ApiError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/agent/report
 * Progress updates and terminal results from the agent.
 * Terminal COMPLETED reports expect outputs to already be uploaded via
 * POST /api/agent/output (the agent does this before reporting completion).
 */
export async function POST(request: NextRequest) {
  try {
    const tokenHash = authenticateAgent(request);
    if (!tokenHash) throw new ApiError("UNAUTHORIZED", "Invalid or missing agent token", 401);

    const report = AgentReportSchema.parse(await request.json());

    const job = await prisma.editingJob.findUnique({
      where: { agentJobId: report.jobId },
      include: { outputs: { orderBy: { createdAt: "asc" } } },
    });
    if (!job) throw new ApiError("NOT_FOUND", `Unknown job ${report.jobId}`, 404);
    if (job.status === "COMPLETED" || job.status === "FAILED") {
      // Idempotent: agent may retry the final report after a network blip.
      return jsonOk({ ok: true, ignored: true, status: job.status });
    }

    if (!report.terminal) {
      // Progress report — only ever move forward.
      const nextStatus = isValidTransition(job.status, report.status) ? report.status : job.status;
      await prisma.editingJob.update({
        where: { id: job.id },
        data: {
          status: nextStatus,
          progress: Math.max(job.progress, report.progress),
          startedAt: job.startedAt ?? new Date(),
        },
      });
      return jsonOk({ ok: true });
    }

    if (report.status === "COMPLETED") {
      // A COMPLETED report with zero uploaded outputs is NOT a success: the
      // agent produced no files. This is what happens when the agent runs in
      // DRY RUN mode (no Photoshop), so reporting it as FAILED keeps the UI
      // honest instead of showing a "completed" job with nothing to display.
      if (job.outputs.length === 0) {
        await prisma.editingJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            errorCode: "NO_OUTPUT",
            errorMessage: getFriendlyError("NO_OUTPUT"),
            completedAt: new Date(),
          },
        });
        if (job.photoId) {
          await prisma.photo.update({ where: { id: job.photoId }, data: { status: "FAILED" } });
        }
        if (job.albumId) {
          await prisma.album.update({ where: { id: job.albumId }, data: { status: "FAILED" } });
        }
        await prisma.agent.updateMany({
          where: { id: job.agentId ?? "" },
          data: { status: "ONLINE", activeJobId: null },
        });
        return jsonOk({ ok: true, failed: true, reason: "NO_OUTPUT" });
      }

      const firstOutput = job.outputs[0];
      await prisma.editingJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          progress: 100,
          outputPath: firstOutput?.path ?? null,
          completedAt: new Date(),
        },
      });
      if (job.photoId) {
        await prisma.photo.update({ where: { id: job.photoId }, data: { status: "COMPLETED" } });
      }
      if (job.albumId) {
        await prisma.album.update({ where: { id: job.albumId }, data: { status: "COMPLETED" } });
      }
      await prisma.agent.updateMany({
        where: { id: job.agentId ?? "" },
        data: { status: "ONLINE", activeJobId: null },
      });
      return jsonOk({ ok: true, completed: true });
    }

    // FAILED
    const friendly = getFriendlyError(report.errorCode, report.errorMessage || undefined);
    await prisma.editingJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorCode: report.errorCode,
        errorMessage: report.errorMessage || friendly,
        completedAt: new Date(),
      },
    });
    if (job.photoId) {
      await prisma.photo.update({ where: { id: job.photoId }, data: { status: "FAILED" } });
    }
    if (job.albumId) {
      await prisma.album.update({ where: { id: job.albumId }, data: { status: "FAILED" } });
    }
    await prisma.agent.updateMany({
      where: { id: job.agentId ?? "" },
      data: { status: "ONLINE", activeJobId: null },
    });
    return jsonOk({ ok: true, failed: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
