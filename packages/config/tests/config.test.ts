import { describe, it, expect } from "vitest";
import {
  chooseLayoutKey,
  slotsForLayout,
  orientationOf,
  LAYOUT_LIBRARY,
  ALBUM_TEMPLATES,
  getTemplate,
} from "../src/layouts";
import { PRESETS, getPreset, DEFAULT_PRESET_KEY } from "../src/presets";
import { FRIENDLY_ERRORS, getFriendlyError } from "../src/errors";

describe("album layout selection (README §12)", () => {
  it("portrait + portrait → portrait layout", () => {
    expect(chooseLayoutKey(["portrait", "portrait"])).toBe("two-vertical");
  });

  it("landscape + landscape → landscape layout", () => {
    expect(chooseLayoutKey(["landscape", "landscape"])).toBe("classic-pair");
  });

  it("portrait + landscape → mixed layout", () => {
    expect(chooseLayoutKey(["portrait", "landscape"])).toBe("two-mixed");
  });

  it("single orientations map to centered single layouts", () => {
    expect(chooseLayoutKey(["portrait"])).toBe("single-portrait-center");
    expect(chooseLayoutKey(["landscape"])).toBe("single-landscape");
    expect(chooseLayoutKey(["square"])).toBe("minimalist-single");
    expect(chooseLayoutKey(["unknown"])).toBe("single-framed");
  });

  it("3 photos → triptych, 4 → grid, 5 → hero+3, 6+ → six grid", () => {
    expect(chooseLayoutKey(["portrait", "portrait", "portrait"])).toBe("three-vertical");
    expect(chooseLayoutKey(["landscape", "landscape", "portrait", "square"])).toBe("four-grid");
    expect(chooseLayoutKey(["landscape", "portrait", "square", "portrait", "landscape"])).toBe("hero-plus-three");
    expect(chooseLayoutKey(new Array(6).fill("landscape"))).toBe("six-grid");
    expect(chooseLayoutKey(new Array(9).fill("landscape"))).toBe("six-grid");
  });

  it("orientationOf classifies ratios", () => {
    expect(orientationOf(4000, 3000)).toBe("landscape");
    expect(orientationOf(3000, 4000)).toBe("portrait");
    expect(orientationOf(2000, 2000)).toBe("square");
    expect(orientationOf(null, null)).toBe("unknown");
  });
});

describe("layout library integrity", () => {
  it("has slots for every album template default layout", () => {
    for (const template of ALBUM_TEMPLATES) {
      const layout = LAYOUT_LIBRARY[template.defaultLayout];
      expect(layout, `${template.key} → ${template.defaultLayout}`).toBeDefined();
      expect(layout.slots.length).toBeGreaterThanOrEqual(1);
      expect(getTemplate(template.key)).toBeDefined();
    }
  });

  it("keeps slots inside the page bounds", () => {
    for (const key of Object.keys(LAYOUT_LIBRARY)) {
      for (const slot of LAYOUT_LIBRARY[key].slots) {
        expect(slot.x).toBeGreaterThanOrEqual(0);
        expect(slot.y).toBeGreaterThanOrEqual(0);
        expect(slot.x + slot.w).toBeLessThanOrEqual(100);
        expect(slot.y + slot.h).toBeLessThanOrEqual(100);
      }
    }
  });

  it("slotsForLayout clamps count", () => {
    expect(slotsForLayout("four-grid", 9).length).toBe(4);
    expect(slotsForLayout("four-grid", 2).length).toBe(2);
    expect(slotsForLayout("missing-layout", 1).length).toBe(1);
  });
});

describe("built-in presets", () => {
  it("has exactly the 8 required presets", () => {
    expect(PRESETS.length).toBe(8);
    const names = PRESETS.map((p) => p.name);
    expect(names).toContain("Natural Wedding");
    expect(names).toContain("Elegant Wedding");
    expect(names).toContain("Bright & Airy");
    expect(names).toContain("Cinematic Wedding");
    expect(names).toContain("Warm Romantic");
    expect(names).toContain("Luxury Wedding");
    expect(names).toContain("Black & White");
    expect(names).toContain("Classic Portrait");
  });

  it("B&W preset requests a monochrome conversion", () => {
    const bw = getPreset("BLACK_WHITE");
    expect(bw?.params.blackWhite).toBe(true);
    expect(bw?.params.saturation).toBeLessThanOrEqual(-100);
  });

  it("default preset exists", () => {
    expect(getPreset(DEFAULT_PRESET_KEY)).toBeDefined();
  });

  it("portrait presets use conservative skin retouch", () => {
    for (const preset of PRESETS) {
      // Subtle by design — never an automatic exaggerated beauty edit.
      expect(preset.params.skinRetouch).toBeLessThanOrEqual(35);
    }
  });
});

describe("friendly error messages (README §20)", () => {
  it("maps known codes to user-friendly text", () => {
    expect(FRIENDLY_ERRORS.PS_NOT_INSTALLED).toMatch(/Photoshop is not available/i);
    expect(FRIENDLY_ERRORS.PS_BUSY).toMatch(/currently processing another image/i);
    expect(FRIENDLY_ERRORS.INVALID_RAW).toMatch(/RAW file could not be opened/i);
  });

  it("falls back for unknown codes", () => {
    expect(getFriendlyError("SOMETHING_ELSE")).toBe(FRIENDLY_ERRORS.UNKNOWN);
    expect(getFriendlyError(null, "custom")).toBe("custom");
  });
});
