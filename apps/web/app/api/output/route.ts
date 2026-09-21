import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { toOutputDTO } from "@/lib/dto";
import { jsonOk, toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/output?jobId=&photoId=&albumId= — list outputs (filters optional). */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const where = {
      jobId: sp.get("jobId") ?? undefined,
      photoId: sp.get("photoId") ?? undefined,
      albumId: sp.get("albumId") ?? undefined,
    };
    const outputs = await prisma.outputFile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return jsonOk({ outputs: outputs.map(toOutputDTO) });
  } catch (err) {
    return toErrorResponse(err);
  }
}
