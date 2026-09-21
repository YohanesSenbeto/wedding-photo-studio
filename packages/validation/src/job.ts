import { z } from "zod";
import { COLOR_MODES, OUTPUT_FORMATS, OUTPUT_QUALITIES } from "@wedding/types";
import { CustomPresetParamsSchema } from "./preset";

/** POST /api/edit — start professional edits for one or more photos. */
export const CreateEditJobSchema = z
  .object({
    /** Photos to edit (must already be uploaded through /api/photos/upload). */
    photoIds: z
      .array(z.string().min(1).max(64))
      .min(1, "Select at least one photo")
      .max(50, "At most 50 photos can be edited at once"),
    /** Built-in preset identifier, e.g. "ELEGANT_WEDDING". */
    presetKey: z.string().min(1).max(64).optional(),
    /** ID of a preset stored in the database. */
    presetId: z.string().min(1).max(64).optional(),
    /** Per-run overrides for the preset sliders (deterministic, adjustable). */
    customParams: CustomPresetParamsSchema.optional(),
    outputFormats: z.array(z.enum(OUTPUT_FORMATS)).min(1).default(["JPG"]),
    quality: z.enum(OUTPUT_QUALITIES).default("HIGH"),
    /** CMYK is applied only on final print exports — never before editing. */
    colorMode: z.enum(COLOR_MODES).default("RGB"),
    dpi: z.coerce.number().int().refine((v) => [72, 150, 300].includes(v), {
      message: "dpi must be 72 (web), 150 (high quality) or 300 (print)",
    }).default(300),
  })
  .strict()
  .refine((v) => v.presetKey || v.presetId || v.customParams, {
    message: "Choose a preset or provide custom parameters",
    path: ["presetKey"],
  })
  .refine(
    (v) => v.colorMode === "RGB" || v.quality === "PRINT",
    { message: "CMYK conversion is only applied for PRINT exports", path: ["colorMode"] }
  );

export type CreateEditJobInput = z.infer<typeof CreateEditJobSchema>;

export const JobIdParamSchema = z.object({ jobId: z.string().min(1).max(64) });

/** Progress snapshot reported by the agent (also used over WebSocket). */
export const JobProgressSchema = z.object({
  jobId: z.string().min(1),
  status: z.enum([
    "CONNECTING",
    "PROCESSING",
    "PHOTOSHOP_OPENING",
    "EDITING",
    "EXPORTING",
  ]),
  progress: z.number().int().min(0).max(100),
  message: z.string().max(500).optional(),
});

export type JobProgress = z.infer<typeof JobProgressSchema>;
