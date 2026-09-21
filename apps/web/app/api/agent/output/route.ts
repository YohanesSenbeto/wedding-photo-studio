import { NextRequest } from "next/server";
import { AgentOutputFileSchema } from "@wedding/validation";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agent-auth";
import { outputStorageRoot, ensureDir, saveUploadedFile } from "@/lib/storage";
import { toOutputDTO } from "@/lib/dto";
import { jsonOk, toErrorResponse, ApiError } from "@/lib/http";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXT_FOR_FORMAT: Record<string, string> = { JPG: "jpg", TIFF: "tif", PSD: "psd" };

/**
 * POST /api/agent/output
 * multipart/form-data: file + jobId + format + kind? + pageTemplateKey? + meta
 * Stores one produced file (JPG/TIFF/PSD) and creates its OutputFile row.
 */
export async function POST(request: NextRequest) {
  try {
    const tokenHash = authenticateAgent(request);
    if (!tokenHash) throw new ApiError("UNAUTHORIZED", "Invalid or missing agent token", 401);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new ApiError("NO_FILE", "Multipart field 'file' is required", 400);
    }
    const jobId = String(form.get("jobId") || "");
    if (!jobId) throw new ApiError("NO_JOB", "Field 'jobId' is required", 400);

    const job = await prisma.editingJob.findUnique({
      where: { agentJobId: jobId },
      include: { album: { include: { pages: true } } },
    });
    if (!job) throw new ApiError("NOT_FOUND", `Unknown job ${jobId}`, 404);

    const meta = AgentOutputFileSchema.parse({
      fileName: String(form.get("fileName") || file.name || "output"),
      format: String(form.get("format") || "JPG"),
      fileSize: file.size,
      width: nullableInt(form.get("width")),
      height: nullableInt(form.get("height")),
      dpi: nullableInt(form.get("dpi")),
      colorMode: strOrNull(form.get("colorMode")),
      pageTemplateKey: strOrNull(form.get("pageTemplateKey")),
    });

    const kind = job.type === "CREATE_ALBUM" ? "ALBUM_PAGE" : "EDITED";
    const ext = EXT_FOR_FORMAT[meta.format] ?? "jpg";

    let destDir: string;
    let baseName: string;
    let albumPageId: string | null = null;
    if (job.albumId) {
      destDir = path.join(outputStorageRoot(), "albums", job.albumId);
      baseName = meta.pageTemplateKey ?? `page-${Date.now()}`;
    } else {
      destDir = path.join(outputStorageRoot(), "edited", job.agentJobId);
      baseName = sanitizeFileName(meta.fileName) || job.agentJobId;
    }
    await ensureDir(destDir);
    const dest = path.join(destDir, `${baseName}.${ext}`);
    await saveUploadedFile(file, dest);

    let albumId: string | null = null;
    if (job.albumId) {
      albumId = job.albumId;
      const page = job.album?.pages.find((p) => p.templateKey === meta.pageTemplateKey);
      albumPageId = page?.id ?? null;
    }

    const output = await prisma.outputFile.create({
      data: {
        fileName: path.basename(dest),
        path: dest,
        fileSize: meta.fileSize,
        format: meta.format,
        kind,
        width: meta.width,
        height: meta.height,
        dpi: meta.dpi,
        colorMode: (meta.colorMode as "RGB" | "CMYK") ?? null,
        jobId: job.id,
        photoId: job.photoId,
        albumId,
        albumPageId,
      },
    });

    if (albumPageId) {
      await prisma.albumPage.update({ where: { id: albumPageId }, data: { outputId: output.id } });
    }

    return jsonOk({ output: toOutputDTO(output) }, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}

function nullableInt(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = v === null ? "" : String(v);
  return s.length > 0 ? s : null;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
}
