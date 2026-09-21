import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { toJobDTO, toOutputDTO } from "@/lib/dto";
import { jsonOk, jsonError, toErrorResponse } from "@/lib/http";
import { sweepStaleJobs } from "@/lib/sweep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/edit/:jobId — job status + progress + produced outputs. */
export async function GET(_request: NextRequest, ctx: { params: Promise<{ jobId: string }> }) {
  try {
    await sweepStaleJobs(prisma);
    const { jobId } = await ctx.params;
    const job = await prisma.editingJob.findUnique({
      where: { id: jobId },
      include: { outputs: true },
    });
    if (!job) return jsonError("NOT_FOUND", "Job not found", 404);
    return jsonOk({
      job: toJobDTO(job),
      outputs: job.outputs.map(toOutputDTO),
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
