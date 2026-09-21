import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { toPhotoDTO } from "@/lib/dto";
import { jsonOk, toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/photos — list photos (newest first). */
export async function GET(_request: NextRequest) {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return jsonOk({ photos: photos.map(toPhotoDTO) });
  } catch (err) {
    return toErrorResponse(err);
  }
}
