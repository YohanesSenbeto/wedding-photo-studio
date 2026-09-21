import type { PresetParams } from "@wedding/validation";

/**
 * Built-in editing presets.
 *
 * These are deterministic, adjustable starting points for Photoshop 2022.
 * They are applied as REAL Photoshop adjustments by the local agent
 * (Curves / Brightness & Contrast / Hue-Saturation / Unsharp Mask / Surface
 * Blur / crops / B&W conversion / vignette). They will not make an arbitrary
 * photo perfect automatically — that is why every value here is conservative
 * and the UI allows refining them before an edit.
 */
export interface WeddingPreset {
  key: string;
  name: string;
  description: string;
  params: PresetParams;
}

export const PRESETS: WeddingPreset[] = [
  {
    key: "NATURAL_WEDDING",
    name: "Natural Wedding",
    description:
      "True-to-life colour with gentle lift in the shadows and a clean, timeless finish.",
    params: {
      exposure: 0.15,
      contrast: 5,
      highlights: -10,
      shadows: 12,
      whites: 5,
      blacks: -5,
      temperature: 4,
      tint: 2,
      saturation: 0,
      vibrance: 8,
      clarity: 5,
      texture: 3,
      sharpness: 35,
      noiseReduction: 10,
      skinRetouch: 15,
      eyeEnhancement: 0,
      cropMode: "AS_SHOT",
      vignette: -8,
      blackWhite: false,
    },
  },
  {
    key: "ELEGANT_WEDDING",
    name: "Elegant Wedding",
    description:
      "Refined contrast, softly deepened blacks and a slightly muted, classy palette.",
    params: {
      exposure: 0.1,
      contrast: 12,
      highlights: -18,
      shadows: 15,
      whites: 8,
      blacks: -12,
      temperature: 8,
      tint: 3,
      saturation: -5,
      vibrance: 10,
      clarity: 8,
      texture: 5,
      sharpness: 45,
      noiseReduction: 12,
      skinRetouch: 25,
      eyeEnhancement: 0,
      cropMode: "AS_SHOT",
      vignette: -15,
      blackWhite: false,
    },
  },
  {
    key: "BRIGHT_AIRY",
    name: "Bright & Airy",
    description:
      "Luminous whites, lifted shadows and a soft pastel glow for daylight weddings.",
    params: {
      exposure: 0.55,
      contrast: -5,
      highlights: -35,
      shadows: 28,
      whites: 15,
      blacks: 8,
      temperature: 10,
      tint: 4,
      saturation: 5,
      vibrance: 12,
      clarity: 2,
      texture: 2,
      sharpness: 30,
      noiseReduction: 18,
      skinRetouch: 30,
      eyeEnhancement: 0,
      cropMode: "AS_SHOT",
      vignette: -5,
      blackWhite: false,
    },
  },
  {
    key: "CINEMATIC_WEDDING",
    name: "Cinematic Wedding",
    description:
      "Moody teal-leaning grade, crushed blacks, gentle vignette and a widescreen crop.",
    params: {
      exposure: -0.1,
      contrast: 20,
      highlights: -25,
      shadows: -5,
      whites: -5,
      blacks: -20,
      temperature: -8,
      tint: -6,
      saturation: -12,
      vibrance: 5,
      clarity: 10,
      texture: 8,
      sharpness: 40,
      noiseReduction: 8,
      skinRetouch: 20,
      eyeEnhancement: 0,
      cropMode: "LANDSCAPE_16_9",
      vignette: -30,
      blackWhite: false,
    },
  },
  {
    key: "WARM_ROMANTIC",
    name: "Warm Romantic",
    description:
      "Golden warmth, soft skin-friendly contrast and a tender glow for golden hour.",
    params: {
      exposure: 0.2,
      contrast: 8,
      highlights: -15,
      shadows: 18,
      whites: 6,
      blacks: -4,
      temperature: 25,
      tint: 8,
      saturation: 8,
      vibrance: 14,
      clarity: 3,
      texture: 2,
      sharpness: 30,
      noiseReduction: 15,
      skinRetouch: 30,
      eyeEnhancement: 0,
      cropMode: "AS_SHOT",
      vignette: -12,
      blackWhite: false,
    },
  },
  {
    key: "LUXURY_WEDDING",
    name: "Luxury Wedding",
    description:
      "Editorial look — deep blacks, crisp micro-contrast and restrained saturation.",
    params: {
      exposure: 0.05,
      contrast: 15,
      highlights: -20,
      shadows: 10,
      whites: 10,
      blacks: -25,
      temperature: 5,
      tint: 0,
      saturation: -8,
      vibrance: 10,
      clarity: 15,
      texture: 10,
      sharpness: 55,
      noiseReduction: 6,
      skinRetouch: 20,
      eyeEnhancement: 0,
      cropMode: "AS_SHOT",
      vignette: -22,
      blackWhite: false,
    },
  },
  {
    key: "BLACK_WHITE",
    name: "Black & White",
    description:
      "Classic monochrome conversion with rich tonal depth and film-like grain control.",
    params: {
      exposure: 0.15,
      contrast: 18,
      highlights: -20,
      shadows: 15,
      whites: 10,
      blacks: -15,
      temperature: 0,
      tint: 0,
      saturation: -100,
      vibrance: 0,
      clarity: 12,
      texture: 6,
      sharpness: 50,
      noiseReduction: 12,
      skinRetouch: 25,
      eyeEnhancement: 0,
      cropMode: "AS_SHOT",
      vignette: -18,
      blackWhite: true,
    },
  },
  {
    key: "CLASSIC_PORTRAIT",
    name: "Classic Portrait",
    description:
      "Flattering 4:5 portrait crop with soft, subtle skin retouching and clean detail.",
    params: {
      exposure: 0.1,
      contrast: 6,
      highlights: -12,
      shadows: 12,
      whites: 4,
      blacks: -6,
      temperature: 7,
      tint: 2,
      saturation: 0,
      vibrance: 6,
      clarity: 4,
      texture: 2,
      sharpness: 45,
      noiseReduction: 15,
      skinRetouch: 35,
      eyeEnhancement: 0,
      cropMode: "PORTRAIT_4_5",
      vignette: -10,
      blackWhite: false,
    },
  },
];

export function getPreset(key: string): WeddingPreset | undefined {
  return PRESETS.find((p) => p.key === key);
}

export const DEFAULT_PRESET_KEY = "NATURAL_WEDDING";
