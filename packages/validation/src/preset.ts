import { z } from "zod";
import { CROP_MODES } from "@wedding/types";

/**
 * Deterministic, adjustable editing parameters.
 *
 * NOTE: these values are applied by Photoshop 2022 via the local agent using
 * real Photoshop adjustments (Curves, Brightness/Contrast, Hue/Saturation,
 * Unsharp Mask, Surface Blur, ...). They are deterministic starting points
 * meant to be refined — Photoshop cannot magically produce a perfect
 * professional edit from arbitrary numbers, and this schema exists so every
 * value stays inside safe, predictable ranges.
 */
export const PresetParamsSchema = z.object({
  /** Base correction */
  exposure: z.number().min(-2).max(2),
  contrast: z.number().int().min(-100).max(100),
  highlights: z.number().int().min(-100).max(100),
  shadows: z.number().int().min(-100).max(100),
  whites: z.number().int().min(-100).max(100),
  blacks: z.number().int().min(-100).max(100),

  /** Color */
  temperature: z.number().int().min(-100).max(100),
  tint: z.number().int().min(-100).max(100),
  saturation: z.number().int().min(-100).max(100),
  vibrance: z.number().int().min(-100).max(100),

  /** Detail */
  clarity: z.number().int().min(-100).max(100),
  texture: z.number().int().min(-100).max(100),
  sharpness: z.number().int().min(0).max(150),
  noiseReduction: z.number().int().min(0).max(100),

  /** Portrait */
  skinRetouch: z.number().int().min(0).max(100),
  /** 0 = off, >0 = subtle strength. Never an automatic "beauty" modification. */
  eyeEnhancement: z.number().int().min(0).max(100).default(0),

  /** Composition & finish */
  cropMode: z.enum(CROP_MODES),
  vignette: z.number().int().min(-100).max(100),
  blackWhite: z.boolean().default(false),
});

export type PresetParams = z.infer<typeof PresetParamsSchema>;

/** Schema used when the user tweaks preset sliders in the UI before an edit. */
export const CustomPresetParamsSchema = PresetParamsSchema.partial();

export type CustomPresetParams = z.infer<typeof CustomPresetParamsSchema>;

/** Strict equality check on preset keys to avoid typos drifting between apps. */
export function isPresetParams(value: unknown): value is PresetParams {
  return PresetParamsSchema.safeParse(value).success;
}
