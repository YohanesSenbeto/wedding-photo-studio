import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { toPhotoDTO } from "@/lib/dto";
import { deleteFileQuietly } from "@/lib/storage";
import { jsonOk, jsonError, toErrorResponse, ApiError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DELETE /api/photos/:id — removes DB row, original file and its outputs. */
export async function DELETE(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new ApiError("NOT_FOUND", "Photo not found", 404);

    const activeJob = await prisma.editingJob.findFirst({
      where: { photoId: id, status: { in: ["QUEUED", "CONNECTING", "PROCESSING", "PHOTOSHOP_OPENING", "EDITING", "EXPORTING"] } },
    });
    if (activeJob) {
      throw new ApiError("PHOTO_BUSY", "This photo is currently being processed and cannot be deleted.", 409);
    }

    const outputs = await prisma.outputFile.findMany({ where: { photoId: id } });
    await prisma.$transaction(async (tx) => {
      await tx.outputFile.deleteMany({ where: { photoId: id } });
      await tx.photo.delete({ where: { id } });
    });

    await deleteFileQuietly(photo.filePath);
    for (const o of outputs) await deleteFileQuietly(o.path);

    return jsonOk({ deleted: id });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/** GET /api/photos/:id — single photo metadata. */
export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) return jsonError("NOT_FOUND", "Photo not found", 404);
    return jsonOk({ photo: toPhotoDTO(photo) });
  } catch (err) {
    return toErrorResponse(err);
  }
}
