import { NextRequest } from "next/server";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { prisma } from "@/lib/db";
import { photoStorageRoot, isPathInside } from "@/lib/storage";
import { authenticateAgent } from "@/lib/agent-auth";
import { jsonError, toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  arw: "application/octet-stream",
};

/**
 * GET /api/photos/:id/file — stream the ORIGINAL file.
 * Used by the browser for previews and by the agent (Bearer token) to
 * download originals onto the Windows machine running Photoshop.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const isAgent = authenticateAgent(request) !== null;
    // Agents may fetch any photo with a valid token; browsers get same-origin
    // access (single-tenant studio app). Production multi-user deployments
    // should add user sessions here.
    if (!isAgent && !isLocalRequest(request)) {
      return jsonError("FORBIDDEN", "Forbidden", 403);
    }

    const { id } = await ctx.params;
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) return jsonError("NOT_FOUND", "Photo not found", 404);

    const abs = path.resolve(photo.filePath);
    if (!isPathInside(photoStorageRoot(), abs)) {
      return jsonError("FORBIDDEN", "Invalid path", 403);
    }
    try {
      await fs.access(abs);
    } catch {
      return jsonError("GONE", "Original file is missing on disk", 410);
    }

    const stat = await fs.stat(abs);
    const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream<Uint8Array>;
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": MIME[photo.extension] ?? "application/octet-stream",
        "Content-Length": String(stat.size),
        "Cache-Control": "private, max-age=3600",
        "X-Original-Name": encodeURIComponent(photo.originalName),
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

function isLocalRequest(request: NextRequest): boolean {
  const host = request.headers.get("host") || "";
  return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
}
