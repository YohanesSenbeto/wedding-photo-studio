import { NextRequest } from "next/server";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { prisma } from "@/lib/db";
import { outputStorageRoot, isPathInside } from "@/lib/storage";
import { jsonError, toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  JPG: "image/jpeg",
  TIFF: "image/tiff",
  PSD: "image/vnd.adobe.photoshop",
};

/** GET /api/output/:id/file — download/stream a produced file. */
export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const output = await prisma.outputFile.findUnique({ where: { id } });
    if (!output) return jsonError("NOT_FOUND", "Output not found", 404);

    const abs = path.resolve(output.path);
    if (!isPathInside(outputStorageRoot(), abs)) {
      return jsonError("FORBIDDEN", "Invalid path", 403);
    }
    try {
      await fs.access(abs);
    } catch {
      return jsonError("GONE", "Output file is missing on disk", 410);
    }
    const stat = await fs.stat(abs);
    const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream<Uint8Array>;
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": MIME[output.format] ?? "application/octet-stream",
        "Content-Length": String(stat.size),
        "Content-Disposition": `attachment; filename="${output.fileName.replace(/"/g, "")}"`,
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
