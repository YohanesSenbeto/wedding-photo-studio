/**
 * Shared domain types for the Wedding Photo Studio monorepo.
 *
 * These types intentionally mirror the Prisma enums in `prisma/schema.prisma`
 * so that the web app, the agent and the shared packages speak one language.
 */

/* ------------------------------------------------------------------ */
/* Enums / unions                                                      */
/* ------------------------------------------------------------------ */

export const JOB_STATUSES = [
  "QUEUED",
  "CONNECTING",
  "PROCESSING",
  "PHOTOSHOP_OPENING",
  "EDITING",
  "EXPORTING",
  "COMPLETED",
  "FAILED",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Statuses that mean "still working on it" (used for polling / UI). */
export const ACTIVE_JOB_STATUSES: readonly JobStatus[] = [
  "QUEUED",
  "CONNECTING",
  "PROCESSING",
  "PHOTOSHOP_OPENING",
  "EDITING",
  "EXPORTING",
];

export const PHOTO_STATUSES = [
  "UPLOADED",
  "ANALYZED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "ARCHIVED",
] as const;
export type PhotoStatus = (typeof PHOTO_STATUSES)[number];

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "arw"] as const;
export type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];

export const OUTPUT_FORMATS = ["JPG", "TIFF", "PSD"] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export const OUTPUT_QUALITIES = ["WEB", "HIGH", "PRINT"] as const;
export type OutputQuality = (typeof OUTPUT_QUALITIES)[number];

export const COLOR_MODES = ["RGB", "CMYK"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const OUTPUT_KINDS = ["EDITED", "ALBUM_PAGE", "TEMPLATE", "THUMBNAIL"] as const;
export type OutputKind = (typeof OUTPUT_KINDS)[number];

export const JOB_TYPES = ["EDIT_PHOTO", "CREATE_ALBUM"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const CROP_MODES = [
  "AS_SHOT",
  "AUTO",
  "PORTRAIT_4_5",
  "PORTRAIT_2_3",
  "LANDSCAPE_3_2",
  "LANDSCAPE_16_9",
  "SQUARE_1_1",
] as const;
export type CropMode = (typeof CROP_MODES)[number];

export const AGENT_STATUSES = ["OFFLINE", "ONLINE", "BUSY"] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const ALBUM_STATUSES = ["DRAFT", "QUEUED", "PROCESSING", "COMPLETED", "FAILED"] as const;
export type AlbumStatus = (typeof ALBUM_STATUSES)[number];

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

export interface PhotoDTO {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  extension: ImageExtension;
  width: number | null;
  height: number | null;
  fileSize: number;
  status: PhotoStatus;
  isRaw: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Editing                                                             */
/* ------------------------------------------------------------------ */

export interface EditingJobDTO {
  id: string;
  photoId: string | null;
  albumId: string | null;
  type: JobType;
  status: JobStatus;
  progress: number;
  agentJobId: string | null;
  inputPath: string;
  outputPath: string | null;
  errorMessage: string | null;
  errorCode: string | null;
  friendlyError: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface PresetDTO {
  id: string;
  key: string;
  name: string;
  description: string;
  params: Record<string, unknown>;
  isBuiltIn: boolean;
}

export interface OutputFileDTO {
  id: string;
  jobId: string | null;
  photoId: string | null;
  albumId: string | null;
  kind: OutputKind;
  format: OutputFormat;
  fileName: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  dpi: number | null;
  colorMode: ColorMode | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Albums                                                              */
/* ------------------------------------------------------------------ */

/** "portrait" | "landscape" | "square" | "unknown" */
export type Orientation = "portrait" | "landscape" | "square" | "unknown";

export interface AlbumPageDTO {
  id: string;
  albumId: string;
  order: number;
  templateKey: string;
  templateTitle: string;
  layoutKey: string;
  caption: string | null;
  photoIds: string[];
  outputId: string | null;
}

export interface AlbumDTO {
  id: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  location: string;
  caption: string | null;
  status: AlbumStatus;
  pages: AlbumPageDTO[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Agent                                                               */
/* ------------------------------------------------------------------ */

export interface AgentDTO {
  id: string;
  name: string;
  machineName: string;
  platform: string;
  appVersion: string;
  photoshopVersion: string | null;
  photoshopAvailable: boolean;
  status: AgentStatus;
  lastSeenAt: string;
}

/** A single progress event broadcast by the agent's local WebSocket. */
export interface AgentProgressEvent {
  type: "progress";
  jobId: string;
  status: JobStatus;
  progress: number;
  message?: string;
  photoName?: string;
  at: string;
}

export interface AgentStateEvent {
  type: "state";
  photoshopAvailable: boolean;
  photoshopVersion: string | null;
  busy: boolean;
  activeJobId?: string;
  at: string;
}

export type AgentSocketEvent = AgentProgressEvent | AgentStateEvent;
