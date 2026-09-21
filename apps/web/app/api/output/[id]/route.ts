import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { toOutputDTO } from "@/lib/dto";
import { jsonOk, jsonError, toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/output/:id — output metadata (bytes live at /api/output/:id/file). */
export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const output = await prisma.outputFile.findUnique({ where: { id } });
    if (!output) return jsonError("NOT_FOUND", "Output not found", 404);
    return jsonOk({ output: toOutputDTO(output) });
  } catch (err) {
    return toErrorResponse(err);
  }
}
