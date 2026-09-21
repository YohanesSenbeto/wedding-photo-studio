import { z } from "zod";
import { IMAGE_EXTENSIONS } from "@wedding/types";

/**
 * Photo upload validation — shared between the browser (pre-flight) and the
 * POST /api/photos/upload route (authoritative).
 */

export const JPG_MIME_TYPES = ["image/jpeg", "image/jpg", "image/pjpeg"] as const;
/** Sony ARW has no standardised MIME type; browsers/OSes send one of these. */
export const ARW_MIME_TYPES = [
  "application/octet-stream",
  "image/x-sony-arw",
  "image/x-arw",
  "image/vnd.adobe.photoshop",
  "",
] as const;

export interface UploadLimits {
  /** Max size for JPG/JPEG in bytes */
  maxJpgBytes: number;
  /** Max size for Sony ARW RAW in bytes */
  maxArwBytes: number;
}

export const DEFAULT_UPLOAD_LIMITS: UploadLimits = {
  maxJpgBytes: 40 * 1024 * 1024, // 40 MB
  maxArwBytes: 200 * 1024 * 1024, // 200 MB
};

export function extensionOf(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx + 1).toLowerCase();
}

export const PhotoUploadFileSchema = z
  .object({
    name: z
      .string()
      .min(1, "File name is required")
      .max(255, "File name is too long")
      // Guard against path traversal in client-supplied names.
      .refine((n) => !n.includes("/") && !n.includes("\\") && !n.includes(".."), {
        message: "File name contains invalid path characters",
      }),
    size: z.number().int().positive("File is empty"),
    type: z.string(),
  })
  .strict();

export type PhotoUploadFile = z.infer<typeof PhotoUploadFileSchema>;

export interface ValidatedPhotoUpload {
  originalName: string;
  extension: (typeof IMAGE_EXTENSIONS)[number];
  mimeType: string;
  fileSize: number;
  isRaw: boolean;
}

/** Human readable reason when a file is rejected. */
export class UploadValidationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "UploadValidationError";
    this.code = code;
  }
}

/**
 * Validate one uploaded file (metadata only — never trust the client).
 * Throws UploadValidationError with a user-friendly message.
 */
export function validatePhotoUpload(
  input: unknown,
  limits: UploadLimits = DEFAULT_UPLOAD_LIMITS
): ValidatedPhotoUpload {
  const parsed = PhotoUploadFileSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid file";
    throw new UploadValidationError("INVALID_FILE", msg);
  }

  const { name, size, type } = parsed.data;
  const ext = extensionOf(name);
  const isRaw = ext === "arw";

  if (!isRaw && ext !== "jpg" && ext !== "jpeg") {
    throw new UploadValidationError(
      "UNSUPPORTED_TYPE",
      `"${name}" is not supported. Only .jpg, .jpeg and .arw (Sony RAW) files are allowed.`
    );
  }

  const mimeOk = isRaw
    ? (ARW_MIME_TYPES as readonly string[]).includes(type)
    : (JPG_MIME_TYPES as readonly string[]).includes(type);

  if (!mimeOk) {
    throw new UploadValidationError(
      "UNSUPPORTED_TYPE",
      `"${name}" has an unexpected content type "${type || "unknown"}" for a ${isRaw ? "RAW" : "JPG"} file.`
    );
  }

  const maxBytes = isRaw ? limits.maxArwBytes : limits.maxJpgBytes;
  if (size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new UploadValidationError(
      "FILE_TOO_LARGE",
      `"${name}" is ${(size / (1024 * 1024)).toFixed(1)} MB — the maximum for ${isRaw ? "RAW" : "JPG"} files is ${maxMb} MB.`
    );
  }

  return {
    originalName: name,
    extension: ext === "arw" ? "arw" : "jpg",
    mimeType: isRaw ? "image/x-sony-arw" : "image/jpeg",
    fileSize: size,
    isRaw,
  };
}
