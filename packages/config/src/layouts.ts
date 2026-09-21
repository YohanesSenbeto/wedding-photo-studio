import type { Orientation } from "@wedding/types";

/**
 * Album page geometry, expressed in PERCENT of the page so every page size
 * (A4, 12x12", 30x30cm...) works with the same layouts. The Photoshop JSX
 * converts percent → pixels using the actual document dimensions.
 */
export interface LayoutSlot {
  x: number; // percent from left
  y: number; // percent from top
  w: number; // percent width
  h: number; // percent height
  rotation?: number;
}

export interface AlbumLayout {
  key: string;
  name: string;
  description: string;
  slots: LayoutSlot[];
}

export const LAYOUT_LIBRARY: Record<string, AlbumLayout> = {
  "single-full-bleed": {
    key: "single-full-bleed",
    name: "Full Bleed Single",
    description: "One photo covering the whole page edge to edge.",
    slots: [{ x: 0, y: 0, w: 100, h: 100 }],
  },
  "single-framed": {
    key: "single-framed",
    name: "Framed Single",
    description: "One photo inside an elegant double frame.",
    slots: [{ x: 8, y: 8, w: 84, h: 84 }],
  },
  "single-portrait-center": {
    key: "single-portrait-center",
    name: "Portrait Center",
    description: "4:5 portrait photo centered with generous margins.",
    slots: [{ x: 22, y: 12, w: 56, h: 72 }],
  },
  "single-landscape": {
    key: "single-landscape",
    name: "Landscape Center",
    description: "3:2 landscape photo centered on the page.",
    slots: [{ x: 8, y: 18, w: 84, h: 56 }],
  },
  "two-vertical": {
    key: "two-vertical",
    name: "Portrait Pair",
    description: "Two portrait photos side by side.",
    slots: [
      { x: 8, y: 12, w: 38, h: 76 },
      { x: 54, y: 12, w: 38, h: 76 },
    ],
  },
  "two-mixed": {
    key: "two-mixed",
    name: "Mixed Pair",
    description: "Portrait photo left, landscape photo right.",
    slots: [
      { x: 7, y: 12, w: 34, h: 76 },
      { x: 45, y: 31, w: 48, h: 38 },
    ],
  },
  "three-vertical": {
    key: "three-vertical",
    name: "Vertical Triptych",
    description: "Three portrait photos in a row.",
    slots: [
      { x: 7, y: 15, w: 26, h: 70 },
      { x: 37, y: 15, w: 26, h: 70 },
      { x: 67, y: 15, w: 26, h: 70 },
    ],
  },
  "six-grid": {
    key: "six-grid",
    name: "Six Grid",
    description: "3 x 2 grid for six photos.",
    slots: [
      { x: 7, y: 10, w: 27, h: 37 },
      { x: 36.5, y: 10, w: 27, h: 37 },
      { x: 66, y: 10, w: 27, h: 37 },
      { x: 7, y: 53, w: 27, h: 37 },
      { x: 36.5, y: 53, w: 27, h: 37 },
      { x: 66, y: 53, w: 27, h: 37 },
    ],
  },
  "hero-plus-three": {
    key: "hero-plus-three",
    name: "Hero + Three",
    description: "Large hero photo on top, three smaller photos below.",
    slots: [
      { x: 8, y: 8, w: 84, h: 46 },
      { x: 8, y: 60, w: 26, h: 32 },
      { x: 37, y: 60, w: 26, h: 32 },
      { x: 66, y: 60, w: 26, h: 32 },
    ],
  },
  "collage-4": {
    key: "collage-4",
    name: "Collage",
    description: "Editorial collage: one large photo, three supporting shots.",
    slots: [
      { x: 6, y: 6, w: 52, h: 52 },
      { x: 62, y: 6, w: 32, h: 24 },
      { x: 62, y: 34, w: 32, h: 24 },
      { x: 6, y: 62, w: 88, h: 32 },
    ],
  },
  "four-grid": {
    key: "four-grid",
    name: "Four Grid",
    description: "Four photos in a balanced 2x2 grid.",
    slots: [
      { x: 6, y: 8, w: 42, h: 42 },
      { x: 52, y: 8, w: 42, h: 42 },
      { x: 6, y: 52, w: 42, h: 42 },
      { x: 52, y: 52, w: 42, h: 42 },
    ],
  },
  "classic-pair": {
    key: "classic-pair",
    name: "Classic Pair",
    description: "Two landscape photos side by side.",
    slots: [
      { x: 6, y: 18, w: 42, h: 56 },
      { x: 52, y: 18, w: 42, h: 56 },
    ],
  },
  "luxury-single": {
    key: "luxury-single",
    name: "Luxury",
    description: "Full-width photo with a wide gallery frame and gold accents.",
    slots: [{ x: 10, y: 10, w: 80, h: 80 }],
  },
  "minimalist-single": {
    key: "minimalist-single",
    name: "Minimalist",
    description: "One photo floating in generous negative space.",
    slots: [{ x: 20, y: 18, w: 60, h: 64 }],
  },
};

export interface AlbumTemplate {
  key: string;
  title: string;
  description: string;
  defaultLayout: string;
}

/** The 12 standard wedding album pages. */
export const ALBUM_TEMPLATES: AlbumTemplate[] = [
  { key: "01_Cover", title: "Cover", description: "Album cover with names, date and location.", defaultLayout: "single-full-bleed" },
  { key: "02_Getting_Ready", title: "Getting Ready", description: "Preparation moments, side by side.", defaultLayout: "two-vertical" },
  { key: "03_Bride", title: "Bride", description: "Elegant solo portrait of the bride.", defaultLayout: "single-portrait-center" },
  { key: "04_Groom", title: "Groom", description: "Solo portrait of the groom.", defaultLayout: "single-portrait-center" },
  { key: "05_Ceremony", title: "Ceremony", description: "Hero ceremony shot with three details.", defaultLayout: "hero-plus-three" },
  { key: "06_Family", title: "Family", description: "Family groupings in a classic grid.", defaultLayout: "four-grid" },
  { key: "07_Couple_Portraits", title: "Couple Portraits", description: "Portrait + landscape couple pairing.", defaultLayout: "two-mixed" },
  { key: "08_Reception", title: "Reception", description: "Reception atmosphere, three verticals.", defaultLayout: "three-vertical" },
  { key: "09_Dance", title: "Dance", description: "First dance as a single landscape image.", defaultLayout: "single-landscape" },
  { key: "10_Details", title: "Details", description: "Rings, flowers, decor — four-up grid.", defaultLayout: "four-grid" },
  { key: "11_Candid", title: "Candid", description: "Editorial collage of candid moments.", defaultLayout: "collage-4" },
  { key: "12_Final_Portrait", title: "Final Portrait", description: "Closing luxury portrait with gold frame.", defaultLayout: "luxury-single" },
];

export function getTemplate(key: string): AlbumTemplate | undefined {
  return ALBUM_TEMPLATES.find((t) => t.key === key);
}

export function orientationOf(width: number | null, height: number | null): Orientation {
  if (!width || !height) return "unknown";
  const ratio = width / height;
  if (ratio > 1.05) return "landscape";
  if (ratio < 0.95) return "portrait";
  return "square";
}

/**
 * Automatically select the appropriate layout from photo orientations.
 * Rules (README §12):
 *   portrait + portrait   → portrait layout (two-vertical)
 *   landscape + landscape → landscape layout (classic-pair)
 *   portrait + landscape  → mixed layout (two-mixed)
 */
export function chooseLayoutKey(orientations: Orientation[]): string {
  if (orientations.length === 0) return "single-framed";
  const n = orientations.length;

  if (n === 1) {
    switch (orientations[0]) {
      case "portrait":
        return "single-portrait-center";
      case "landscape":
        return "single-landscape";
      case "square":
        return "minimalist-single";
      default:
        return "single-framed";
    }
  }

  if (n === 2) {
    const [a, b] = orientations;
    if (a === "portrait" && b === "portrait") return "two-vertical";
    if (a === "landscape" && b === "landscape") return "classic-pair";
    if (a === "square" && b === "square") return "four-grid";
    return "two-mixed";
  }

  if (n === 3) return "three-vertical";
  if (n === 4) return "four-grid";
  if (n === 5) return "hero-plus-three";
  return "six-grid"; // 6 or more → first six photos
}

/** First N slots of a layout, defensively clamped to 1..6. */
export function slotsForLayout(layoutKey: string, count: number): LayoutSlot[] {
  const layout = LAYOUT_LIBRARY[layoutKey] ?? LAYOUT_LIBRARY["single-framed"];
  const n = Math.max(1, Math.min(6, layout.slots.length, count));
  return layout.slots.slice(0, n);
}
