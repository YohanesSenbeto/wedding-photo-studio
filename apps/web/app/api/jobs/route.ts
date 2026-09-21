import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { toJobDTO } from "@/lib/dto";
import { jsonOk, toErrorResponse } from "@/lib/http";
import { sweepStaleJobs, sweepOfflineAgents } from "@/lib/sweep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/jobs — list recent jobs (UI polling endpoint). */
export async function GET(_request: NextRequest) {
  try {
    await sweepStaleJobs(prisma);
    await sweepOfflineAgents(prisma);
    const jobs = await prisma.editingJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { photo: { select: { originalName: true, extension: true } } },
    });
    return jsonOk({
      jobs: jobs.map((j) => ({
        ...toJobDTO(j),
        photoName: j.photo?.originalName ?? null,
        photoExtension: j.photo?.extension ?? null,
      })),
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
