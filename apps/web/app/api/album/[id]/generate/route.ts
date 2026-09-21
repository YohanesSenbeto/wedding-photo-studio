import { NextRequest } from "next/server";
import { GenerateAlbumSchema, AlbumPayloadSchema } from "@wedding/validation";
import { LAYOUT_LIBRARY, slotsForLayout, getTemplate, type LayoutSlot } from "@wedding/config";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { toJobDTO } from "@/lib/dto";
import { jsonOk, toErrorResponse, ApiError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/album/:id/generate
 * Builds the album page payload (slots + photo assignment) and queues a
 * CREATE_ALBUM job for the local Photoshop agent.
 *
 * Photo assignment: explicit `assignments` (templateKey → photoIds) wins;
 * otherwise the photos already saved on each page are used.
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = GenerateAlbumSchema.parse(await request.json().catch(() => ({})));

    const album = await prisma.album.findUnique({
      where: { id },
      include: { pages: { orderBy: { order: "asc" } } },
    });
    if (!album) throw new ApiError("NOT_FOUND", "Album not found", 404);
    if (album.pages.length === 0) {
      throw new ApiError("ALBUM_EMPTY", "Album has no pages", 400);
    }

    // Apply explicit assignments to pages.
    if (body.assignments) {
      for (const page of album.pages) {
        const assigned = body.assignments[page.templateKey];
        if (assigned) {
          await prisma.albumPage.update({
            where: { id: page.id },
            data: { photoIds: assigned },
          });
          page.photoIds = assigned;
        }
      }
    }

    // Verify photos exist and collect orientation-aware layouts.
    const usedPhotoIds = [...new Set(album.pages.flatMap((p) => p.photoIds))];
    const photos = await prisma.photo.findMany({ where: { id: { in: usedPhotoIds } } });
    const photoById = new Map(photos.map((p) => [p.id, p]));
    const missing = usedPhotoIds.filter((pid) => !photoById.has(pid));
    if (missing.length > 0) {
      throw new ApiError("PHOTO_NOT_FOUND", `Unknown photos: ${missing.join(", ")}`, 400);
    }
    if (usedPhotoIds.length === 0) {
      throw new ApiError(
        "ALBUM_NO_PHOTOS",
        "Assign photos to album pages before generating (use the Albums page).",
        400
      );
    }

    const pages = album.pages.map((page) => {
      const layout = LAYOUT_LIBRARY[page.layoutKey] ?? LAYOUT_LIBRARY["single-framed"];
      const template = getTemplate(page.templateKey);
      const slotCount = Math.max(layout.slots.length, page.photoIds.length);
      const slots = slotsForLayout(page.layoutKey, slotCount);
      return {
        templateKey: page.templateKey,
        templateTitle: template?.title ?? page.templateTitle,
        layoutKey: page.layoutKey,
        order: page.order,
        width: 3508,
        height: 2480,
        slots: slots.map((slot: LayoutSlot, i: number) => ({
          x: slot.x,
          y: slot.y,
          w: slot.w,
          h: slot.h,
          rotation: slot.rotation ?? 0,
          photoId: page.photoIds[i] ?? null,
          photoUrl: page.photoIds[i] ? `/api/photos/${page.photoIds[i]}/file` : null,
          caption: null,
        })),
        caption: page.caption,
      };
    });

    const albumPayload = {
      groomName: album.groomName,
      brideName: album.brideName,
      weddingDate: album.weddingDate,
      location: album.location,
      caption: album.caption,
      pages,
    };
    // Validate the payload before persisting anything.
    const validated = AlbumPayloadSchema.parse(albumPayload);

    const job = await prisma.editingJob.create({
      data: {
        agentJobId: randomUUID(),
        type: "CREATE_ALBUM",
        status: "QUEUED",
        progress: 0,
        albumId: album.id,
        inputPath: "-",
        params: {
          outputFormats: body.outputFormats,
          quality: body.quality,
          colorMode: body.colorMode,
          dpi: body.dpi,
          album: validated,
        },
      },
      include: { outputs: true },
    });

    await prisma.album.update({ where: { id: album.id }, data: { status: "QUEUED" } });

    return jsonOk({ job: toJobDTO(job) }, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
