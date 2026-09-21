import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { toAlbumDTO } from "@/lib/dto";
import { jsonOk, toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/album — list albums with pages. */
export async function GET(_request: NextRequest) {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { pages: { orderBy: { order: "asc" } } },
    });
    return jsonOk({ albums: albums.map(toAlbumDTO) });
  } catch (err) {
    return toErrorResponse(err);
  }
}
