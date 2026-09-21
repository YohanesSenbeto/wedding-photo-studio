import { promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { randomUUID } from "node:crypto";

/**
 * Local file storage for uploaded photos and produced outputs.
 *
 * Development: local disk (PHOTO_STORAGE_PATH / OUTPUT_PATH).
 * Production: the same interface can be pointed at object storage; the agent
 * downloads originals over HTTP (inputUrl) and uploads outputs back, so the
 * agent never requires a shared filesystem with the server.
 */

export function photoStorageRoot(): string {
  return path.resolve(process.env.PHOTO_STORAGE_PATH || "./storage/photos");
}

export function outputStorageRoot(): string {
  return path.resolve(process.env.OUTPUT_PATH || "./storage/outputs");
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/** Prevent path traversal: target must stay inside root. */
export function isPathInside(root: string, target: string): boolean {
  const rel = path.relative(root, target);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

export function safeStat(target: string) {
  return fs.stat(target).then(
    (s) => s,
    () => null
  );
}

/** Deterministic, safe storage name for an uploaded photo. */
export function buildPhotoDestPath(originalName: string, extension: string): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const safeExt = extension === "arw" ? "arw" : extension === "jpeg" ? "jpg" : "jpg";
  const fileName = `${randomUUID()}.${safeExt}`;
  const dir = path.join(photoStorageRoot(), "uploads", yyyy, mm);
  return path.join(dir, fileName);
}

/** Save an uploaded Web File to disk (streams, never buffers whole file). */
export async function saveUploadedFile(file: File, dest: string): Promise<number> {
  await ensureDir(path.dirname(dest));
  const nodeStream = Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]);
  await pipeline(nodeStream, createWriteStream(dest));
  const stat = await fs.stat(dest);
  return stat.size;
}

export async function deleteFileQuietly(target: string): Promise<void> {
  try {
    await fs.unlink(target);
  } catch {
    /* already gone */
  }
}
