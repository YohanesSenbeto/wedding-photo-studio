import { type PrismaClient, Prisma } from "@prisma/client";
import { JOB_STATUSES, type JobStatus } from "@wedding/types";

/**
 * Job status state machine.
 * Statuses may only move FORWARD (see JOB_STATUSES order). Any active status
 * may go straight to FAILED, and COMPLETED is terminal.
 */
const STATUS_ORDER = new Map<JobStatus, number>(
  JOB_STATUSES.map((s, i) => [s, i])
);

export function isValidTransition(from: JobStatus, to: JobStatus): boolean {
  if (from === to) return false;
  if (from === "COMPLETED" || from === "FAILED") return false;
  const a = STATUS_ORDER.get(from);
  const b = STATUS_ORDER.get(to);
  if (a === undefined || b === undefined) return false;
  return b > a;
}

export const ACTIVE_STATUSES: JobStatus[] = [
  "QUEUED",
  "CONNECTING",
  "PROCESSING",
  "PHOTOSHOP_OPENING",
  "EDITING",
  "EXPORTING",
];

export interface CreateEditJobsParams {
  photoIds: string[];
  presetParams: Record<string, unknown>;
  presetKey: string;
  presetId: string | null;
  outputFormats: string[];
  quality: string;
  colorMode: string;
  dpi: number;
}

export async function createEditJobs(
  prisma: PrismaClient,
  input: CreateEditJobsParams
) {
  const photos = await prisma.photo.findMany({
    where: { id: { in: input.photoIds } },
  });
  if (photos.length !== input.photoIds.length) {
    const found = new Set(photos.map((p) => p.id));
    const missing = input.photoIds.filter((id) => !found.has(id));
    throw Object.assign(
      new Error(`Photo(s) not found: ${missing.join(", ")}`),
      { statusCode: 400, code: "PHOTO_NOT_FOUND" }
    );
  }

  const { randomUUID } = await import("node:crypto");
  const jobs = await prisma.$transaction(async (tx) => {
    const created: Awaited<ReturnType<typeof tx.editingJob.create>>[] = [];
    for (const photo of photos) {
      const job = await tx.editingJob.create({
        data: {
          agentJobId: randomUUID(),
          type: "EDIT_PHOTO",
          status: "QUEUED",
          progress: 0,
          photoId: photo.id,
          presetId: input.presetId,
          params: {
            presetKey: input.presetKey,
            presetParams: input.presetParams as Prisma.InputJsonValue,
            outputFormats: input.outputFormats,
            quality: input.quality,
            colorMode: input.colorMode,
            dpi: input.dpi,
          },
          inputPath: photo.filePath,
        },
      });
      created.push(job);
    }
    return created;
  });

  return jobs;
}
