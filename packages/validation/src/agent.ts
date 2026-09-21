import { z } from "zod";
import { COLOR_MODES, OUTPUT_FORMATS, OUTPUT_QUALITIES } from "@wedding/types";
import { PresetParamsSchema } from "./preset";

/**
 * Agent ↔ Server contracts.
 *
 * SECURITY: the agent NEVER accepts arbitrary commands from the browser.
 * Every payload crossing the wire is one of these strict schemas.
 */

/* ---------------------------- Agent → Server --------------------------- */

export const AgentRegisterSchema = z
  .object({
    name: z.string().min(1).max(80),
    machineName: z.string().min(1).max(120),
    platform: z.string().min(1).max(40),
    appVersion: z.string().min(1).max(40),
    photoshopVersion: z.string().max(40).nullable().default(null),
    photoshopAvailable: z.boolean().default(false),
    photoshopMode: z.enum(["COM", "DRYRUN"]).default("COM"),
  })
  .strict();

export type AgentRegisterInput = z.infer<typeof AgentRegisterSchema>;

export const AgentHeartbeatSchema = z
  .object({
    status: z.enum(["ONLINE", "BUSY"]),
    activeJobId: z.string().max(64).nullable().default(null),
    photoshopAvailable: z.boolean(),
    photoshopVersion: z.string().max(40).nullable().default(null),
    diskFreeBytes: z.number().int().nonnegative().optional(),
  })
  .strict();

export type AgentHeartbeatInput = z.infer<typeof AgentHeartbeatSchema>;

export const AgentClaimRequestSchema = z
  .object({
    maxJobs: z.number().int().min(1).max(5).default(1),
  })
  .strict();

/* ---------------------------- Server → Agent --------------------------- */

export const AlbumSlotSchema = z
  .object({
    /** Percent-based rectangle of the album page: x, y, w, h (0..100). */
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    /** Photo to fill the slot (already-uploaded photo id). */
    photoId: z.string().max(64).nullable(),
    /** Download URL for the photo (sent with the agent token). */
    photoUrl: z.string().max(2000).nullable(),
    rotation: z.number().min(-360).max(360).default(0),
    caption: z.string().max(200).nullable().default(null),
  })
  .strict();

export type AlbumSlot = z.infer<typeof AlbumSlotSchema>;

export const AlbumPagePayloadSchema = z
  .object({
    templateKey: z.string().min(1).max(80),
    templateTitle: z.string().min(1).max(120),
    layoutKey: z.string().min(1).max(80),
    order: z.number().int().min(0),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    slots: z.array(AlbumSlotSchema).min(1).max(6),
    caption: z.string().max(200).nullable().default(null),
  })
  .strict();

export type AlbumPagePayload = z.infer<typeof AlbumPagePayloadSchema>;

export const AlbumPayloadSchema = z
  .object({
    groomName: z.string().min(1).max(80),
    brideName: z.string().min(1).max(80),
    weddingDate: z.string().min(1).max(40),
    location: z.string().min(1).max(120),
    caption: z.string().max(200).nullable().default(null),
    pages: z.array(AlbumPagePayloadSchema).min(1).max(48),
  })
  .strict();

export type AlbumPayload = z.infer<typeof AlbumPayloadSchema>;

/**
 * The strict job schema handed to the agent. There is no "command" field —
 * the agent decides *how* to execute each well-known operation in Photoshop.
 */
export const AgentJobPayloadSchema = z
  .object({
    jobId: z.string().min(1).max(64),
    /** Server-side job row id */
    dbJobId: z.string().min(1).max(64),
    operation: z.enum(["EDIT_PHOTO", "CREATE_ALBUM"]),
    /** Local (server-side) absolute path of the input, when storage is shared. */
    inputPath: z.string().max(2000).nullable().default(null),
    /** HTTP URL to download the input when the agent has no shared filesystem. */
    inputUrl: z.string().max(2000).nullable().default(null),
    photoId: z.string().max(64).nullable().default(null),
    photoName: z.string().max(255).default(""),
    extension: z.enum(["jpg", "jpeg", "arw"]).default("jpg"),
    presetKey: z.string().max(64).default("NATURAL_WEDDING"),
    presetParams: PresetParamsSchema,
    outputFormats: z.array(z.enum(OUTPUT_FORMATS)).min(1).default(["JPG"]),
    quality: z.enum(OUTPUT_QUALITIES).default("HIGH"),
    colorMode: z.enum(COLOR_MODES).default("RGB"),
    dpi: z.number().int().min(72).max(480).default(300),
    album: AlbumPayloadSchema.nullable().default(null),
    /** Agent-side map of photoId → local downloaded file path (albums). */
    albumInputs: z.record(z.string().min(1), z.string().max(2000)).default({}),
    /** Where the agent expects exports to be written (agent-side only). */
    outputDir: z.string().max(2000).default(""),
    /** Agent-side dirs for generated PSD templates and temp prep files. */
    templatesDir: z.string().max(2000).default(""),
    tempDir: z.string().max(2000).default(""),
    /** Base URL used to upload finished outputs back to the server. */
    outputUploadUrl: z.string().max(2000),
    reportUrl: z.string().max(2000),
  })
  .strict();

export type AgentJobPayload = z.infer<typeof AgentJobPayloadSchema>;

export const AgentClaimResponseSchema = z
  .object({
    jobs: z.array(AgentJobPayloadSchema),
  })
  .strict();

export type AgentClaimResponse = z.infer<typeof AgentClaimResponseSchema>;

/* ---------------------------- Agent → Server --------------------------- */

/** Upload metadata for one produced file. */
export const AgentOutputFileSchema = z
  .object({
    fileName: z.string().min(1).max(255),
    format: z.enum(OUTPUT_FORMATS),
    fileSize: z.number().int().nonnegative(),
    width: z.number().int().positive().nullable().default(null),
    height: z.number().int().positive().nullable().default(null),
    dpi: z.number().int().positive().nullable().default(null),
    colorMode: z.enum(COLOR_MODES).nullable().default(null),
    /** For album jobs: the template key of the page this file belongs to. */
    pageTemplateKey: z.string().max(80).nullable().default(null),
  })
  .strict();

export type AgentOutputFileMeta = z.infer<typeof AgentOutputFileSchema>;

/**
 * Job report. Progress reports (non-terminal) and terminal reports are
 * discriminated so the server can never mix them up.
 */
export const AgentReportSchema = z.discriminatedUnion("terminal", [
  z
    .object({
      jobId: z.string().min(1).max(64),
      terminal: z.literal(false),
      status: z.enum(["PROCESSING", "PHOTOSHOP_OPENING", "EDITING", "EXPORTING"]),
      progress: z.number().int().min(0).max(100),
      message: z.string().max(500).default(""),
    })
    .strict(),
  z
    .object({
      jobId: z.string().min(1).max(64),
      terminal: z.literal(true),
      status: z.enum(["COMPLETED", "FAILED"]),
      /** Machine-readable error code, mapped server-side to friendly text. */
      errorCode: z.string().max(64).default("UNKNOWN"),
      errorMessage: z.string().max(2000).default(""),
      outputs: z.array(AgentOutputFileSchema).default([]),
      /** Where the agent stored outputs locally (informational). */
      localOutputDir: z.string().max(2000).default(""),
    })
    .strict(),
]);

export type AgentReport = z.infer<typeof AgentReportSchema>;
