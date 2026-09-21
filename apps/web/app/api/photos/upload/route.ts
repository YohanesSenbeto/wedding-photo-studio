import { NextRequest } from "next/server";
import { validatePhotoUpload } from "@wedding/validation";
import { getUploadLimits } from "@wedding/config/server";
import { prisma } from "@/lib/db";
import { buildPhotoDestPath, saveUploadedFile } from "@/lib/storage";
import { probeImageDimensions } from "@/lib/metadata";
import { toPhotoDTO } from "@/lib/dto";
import { jsonOk, toErrorResponse, ApiError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/photos/upload
 * multipart/form-data with one or more fields named "files".
 * Returns { photos: PhotoDTO[], failed: {name, error}[] }.
 */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const entries = form.getAll("files").filter((f): f is File => f instanceof File);
    if (entries.length === 0) {
      throw new ApiError("NO_FILES", "No files were provided (field name must be 'files').", 400);
    }
    if (entries.length > 100) {
      throw new ApiError("TOO_MANY_FILES", "Upload at most 100 files at a time.", 400);
    }

    const limits = getUploadLimits();
    const photos = [];
    const failed: { name: string; error: string }[] = [];

    for (const file of entries) {
      try {
        const meta = validatePhotoUpload({ name: file.name, size: file.size, type: file.type }, limits);
        const dest = buildPhotoDestPath(file.name, meta.extension);
        const written = await saveUploadedFile(file, dest);
        if (written !== meta.fileSize) {
          throw new ApiError(
            "UPLOAD_TRUNCATED",
            `Expected ${meta.fileSize} bytes but stored ${written}. Retry the upload.`,
            500
          );
        }
        const dims = await probeImageDimensions(dest, meta.extension);
        const fileName = dest.split("/").pop() || dest.split("\\").pop() || dest;
        const photo = await prisma.photo.create({
          data: {
            originalName: meta.originalName,
            fileName,
            filePath: dest,
            mimeType: meta.mimeType,
            extension: meta.extension,
            width: dims.width,
            height: dims.height,
            fileSize: meta.fileSize,
            status: dims.width && dims.height ? "ANALYZED" : "UPLOADED",
          },
        });
        photos.push(toPhotoDTO(photo));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed for this file";
        failed.push({ name: file.name, error: message });
      }
    }

    return jsonOk({ photos, failed }, photos.length > 0 ? 201 : 400);
  } catch (err) {
    return toErrorResponse(err);
  }
}
