import { AgentJobPayloadSchema, type AgentJobPayload } from "@wedding/validation";
import { LAYOUT_LIBRARY, slotsForLayout, type LayoutSlot } from "@wedding/config";
import type { EditingJob, Photo, Album, AlbumPage, EditingPreset } from "@prisma/client";
import { ApiError } from "./http";

type JobWithRelations = EditingJob & {
  photo: Photo | null;
  album: (Album & { pages: AlbumPage[] }) | null;
  preset: EditingPreset | null;
};

interface PayloadParams {
  /** Prisma params JSON snapshot created when the job was queued. */
  params: PrismaJsonValue;
}

type PrismaJsonValue =
  | string
  | number
  | boolean
  | null
  | PrismaJsonValue[]
  | { [key: string]: PrismaJsonValue };

interface EditParamsSnapshot {
  presetKey?: string;
  presetParams?: Record<string, unknown>;
  outputFormats?: string[];
  quality?: string;
  colorMode?: string;
  dpi?: number;
}

function asEditSnapshot(params: PrismaJsonValue | null): EditParamsSnapshot {
  if (params && typeof params === "object" && !Array.isArray(params)) {
    return params as EditParamsSnapshot;
  }
  return {};
}

/**
 * Build the strict, Zod-validated job payload handed to the local agent.
 * URLs are server-relative ("/api/..."); the agent resolves them against its
 * own SERVER_URL so the payload stays transport-agnostic.
 */
export function buildAgentPayload(job: JobWithRelations): AgentJobPayload {
  const snapshot = asEditSnapshot((job.params ?? null) as PrismaJsonValue | null);
  const reportUrl = "/api/agent/report";
  const outputUploadUrl = "/api/agent/output";

  if (job.type === "EDIT_PHOTO") {
    if (!job.photo) {
      throw new ApiError("JOB_CORRUPT", "EDIT_PHOTO job has no photo", 500);
    }
    const payload = {
      jobId: job.agentJobId,
      dbJobId: job.id,
      operation: "EDIT_PHOTO" as const,
      inputPath: job.inputPath,
      inputUrl: `/api/photos/${job.photo.id}/file`,
      photoId: job.photo.id,
      photoName: job.photo.originalName,
      extension: job.photo.extension === "arw" ? ("arw" as const) : ("jpg" as const),
      presetKey: snapshot.presetKey ?? job.preset?.key ?? "NATURAL_WEDDING",
      presetParams: snapshot.presetParams ?? {},
      outputFormats: snapshot.outputFormats ?? ["JPG"],
      quality: snapshot.quality ?? "HIGH",
      colorMode: snapshot.colorMode ?? "RGB",
      dpi: snapshot.dpi ?? 300,
      album: null,
      outputUploadUrl,
      reportUrl,
    };
    return AgentJobPayloadSchema.parse(payload);
  }

  // CREATE_ALBUM
  const album = job.album;
  if (!album) {
    throw new ApiError("JOB_CORRUPT", "CREATE_ALBUM job has no album", 500);
  }
  const pages = [...album.pages].sort((a, b) => a.order - b.order).map((page) => {
    const layout = LAYOUT_LIBRARY[page.layoutKey] ?? LAYOUT_LIBRARY["single-framed"];
    const slots: LayoutSlot[] = Array.isArray(page.params)
      ? (page.params as unknown as LayoutSlot[])
      : slotsForLayout(page.layoutKey, Math.max(1, page.photoIds.length));
    return {
      templateKey: page.templateKey,
      templateTitle: page.templateTitle,
      layoutKey: page.layoutKey,
      order: page.order,
      // Album pages render at A4 landscape @300dpi by default; JSX scales to doc.
      width: 3508,
      height: 2480,
      slots: slots.map((slot, i) => ({
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

  const payload = {
    jobId: job.agentJobId,
    dbJobId: job.id,
    operation: "CREATE_ALBUM" as const,
    inputPath: "-",
    inputUrl: null,
    photoId: null,
    photoName: `${album.groomName}-${album.brideName}-album`,
    extension: "jpg" as const,
    presetKey: "NATURAL_WEDDING",
    presetParams: snapshot.presetParams ?? {},
    outputFormats: snapshot.outputFormats ?? ["JPG"],
    quality: snapshot.quality ?? "PRINT",
    colorMode: snapshot.colorMode ?? "RGB",
    dpi: snapshot.dpi ?? 300,
    album: {
      groomName: album.groomName,
      brideName: album.brideName,
      weddingDate: album.weddingDate,
      location: album.location,
      caption: album.caption,
      pages,
    },
    outputUploadUrl,
    reportUrl,
  };
  return AgentJobPayloadSchema.parse(payload);
}
