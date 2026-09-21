import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { toAlbumDTO } from "@/lib/dto";
import { jsonOk, toErrorResponse, ApiError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AssignSchema = z.object({
  assignments: z.record(z.string().max(80), z.array(z.string().min(1).max(64)).max(6)),
});

/**
 * POST /api/album/:id/assign
 * Save per-page photo assignments: { assignments: { "03_Bride": ["photoId"] } }
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { assignments } = AssignSchema.parse(await request.json());

    const album = await prisma.album.findUnique({
      where: { id },
      include: { pages: true },
    });
    if (!album) throw new ApiError("NOT_FOUND", "Album not found", 404);

    for (const [templateKey, photoIds] of Object.entries(assignments)) {
      const page = album.pages.find((p) => p.templateKey === templateKey);
      if (!page) throw new ApiError("PAGE_NOT_FOUND", `No page ${templateKey} in this album`, 400);
      await prisma.albumPage.update({
        where: { id: page.id },
        data: { photoIds },
      });
    }

    const updated = await prisma.album.findUnique({
      where: { id },
      include: { pages: { orderBy: { order: "asc" } } },
    });
    return jsonOk({ album: updated ? toAlbumDTO(updated) : null });
  } catch (err) {
    return toErrorResponse(err);
  }
}
