import { describe, it, expect } from "vitest";
import {
  PresetParamsSchema,
  validatePhotoUpload,
  UploadValidationError,
  CreateEditJobSchema,
  AgentReportSchema,
  AgentJobPayloadSchema,
  CreateAlbumSchema,
  DEFAULT_UPLOAD_LIMITS,
} from "../src/index";
import { PRESETS } from "@wedding/config";

describe("preset validation", () => {
  it("accepts every built-in preset as-is", () => {
    for (const preset of PRESETS) {
      const result = PresetParamsSchema.safeParse(preset.params);
      expect(result.success, `${preset.key} must validate`).toBe(true);
    }
  });

  it("rejects out-of-range exposure", () => {
    expect(PresetParamsSchema.safeParse({ exposure: 5 }).success).toBe(false);
  });

  it("rejects unknown crop modes", () => {
    expect(
      PresetParamsSchema.safeParse({ exposure: 0, cropMode: "CINEMASCOPE" }).success
    ).toBe(false);
  });
});

describe("upload validation", () => {
  const jpg = { name: "IMG_0001.JPG", size: 5_000_000, type: "image/jpeg" };
  const arw = { name: "IMG_0002.ARW", size: 50_000_000, type: "application/octet-stream" };

  it("accepts valid jpg and arw files", () => {
    expect(validatePhotoUpload(jpg).extension).toBe("jpg");
    expect(validatePhotoUpload(arw).isRaw).toBe(true);
  });

  it("rejects unsupported types", () => {
    expect(() =>
      validatePhotoUpload({ name: "photo.png", size: 1000, type: "image/png" })
    ).toThrow(UploadValidationError);
  });

  it("rejects path traversal names", () => {
    expect(() =>
      validatePhotoUpload({ name: "../../etc/passwd.jpg", size: 10, type: "image/jpeg" })
    ).toThrow(/invalid path/i);
  });

  it("rejects oversized files per type", () => {
    expect(() =>
      validatePhotoUpload({ ...jpg, size: DEFAULT_UPLOAD_LIMITS.maxJpgBytes + 1 })
    ).toThrow(/maximum/i);
    expect(() =>
      validatePhotoUpload({ ...arw, size: DEFAULT_UPLOAD_LIMITS.maxArwBytes + 1 })
    ).toThrow(/maximum/i);
    // RAW gets the larger limit — a 60 MB ARW is fine even though JPG caps at 40.
    expect(validatePhotoUpload({ ...arw, size: 60_000_000 }).isRaw).toBe(true);
  });

  it("rejects empty files and bad mime types", () => {
    expect(() => validatePhotoUpload({ ...jpg, size: 0 })).toThrow();
    expect(() => validatePhotoUpload({ ...jpg, type: "text/html" })).toThrow(UploadValidationError);
  });
});

describe("edit job schema", () => {
  it("requires a preset or custom params", () => {
    const result = CreateEditJobSchema.safeParse({ photoIds: ["abc"] });
    expect(result.success).toBe(false);
  });

  it("accepts preset + defaults", () => {
    const result = CreateEditJobSchema.safeParse({
      photoIds: ["abc", "def"],
      presetKey: "ELEGANT_WEDDING",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputFormats).toEqual(["JPG"]);
      expect(result.data.dpi).toBe(300);
    }
  });

  it("only allows CMYK with PRINT quality", () => {
    expect(
      CreateEditJobSchema.safeParse({
        photoIds: ["abc"],
        presetKey: "NATURAL_WEDDING",
        colorMode: "CMYK",
        quality: "WEB",
      }).success
    ).toBe(false);
    expect(
      CreateEditJobSchema.safeParse({
        photoIds: ["abc"],
        presetKey: "NATURAL_WEDDING",
        colorMode: "CMYK",
        quality: "PRINT",
      }).success
    ).toBe(true);
  });

  it("rejects empty photo selection", () => {
    expect(
      CreateEditJobSchema.safeParse({ photoIds: [], presetKey: "NATURAL_WEDDING" }).success
    ).toBe(false);
  });
});

describe("agent report schema", () => {
  it("accepts progress and terminal reports", () => {
    expect(
      AgentReportSchema.safeParse({
        jobId: "j1",
        terminal: false,
        status: "EDITING",
        progress: 65,
      }).success
    ).toBe(true);
    expect(
      AgentReportSchema.safeParse({
        jobId: "j1",
        terminal: true,
        status: "COMPLETED",
        outputs: [
          { fileName: "a.jpg", format: "JPG", fileSize: 10, width: 100, height: 100, dpi: 300, colorMode: "RGB", pageTemplateKey: null },
        ],
      }).success
    ).toBe(true);
  });

  it("rejects a command-style payload (no arbitrary execution, §18)", () => {
    const result = AgentReportSchema.safeParse({ jobId: "j1", command: "rm -rf /" });
    expect(result.success).toBe(false);
  });
});

describe("agent job payload schema (strict, §18)", () => {
  const base = {
    jobId: "agent-job-1",
    dbJobId: "db-1",
    operation: "EDIT_PHOTO",
    inputPath: "/data/photos/a.jpg",
    inputUrl: null,
    photoId: "p1",
    photoName: "a.jpg",
    extension: "jpg",
    presetKey: "NATURAL_WEDDING",
    presetParams: PRESETS[0].params,
    outputFormats: ["JPG"],
    quality: "HIGH",
    colorMode: "RGB",
    dpi: 300,
    album: null,
    outputUploadUrl: "/api/agent/output",
    reportUrl: "/api/agent/report",
  };

  it("accepts a well-formed payload", () => {
    expect(AgentJobPayloadSchema.safeParse(base).success).toBe(true);
  });

  it("rejects unknown fields (no 'command' escape hatch)", () => {
    expect(AgentJobPayloadSchema.safeParse({ ...base, command: "dir" }).success).toBe(false);
  });

  it("applies defaults for albumInputs/outputDir", () => {
    const parsed = AgentJobPayloadSchema.parse(base);
    expect(parsed.albumInputs).toEqual({});
    expect(parsed.outputDir).toBe("");
  });
});

describe("album schema", () => {
  it("requires groom, bride, date and location", () => {
    expect(
      CreateAlbumSchema.safeParse({ groomName: "Joni", brideName: "Astu" }).success
    ).toBe(false);
    expect(
      CreateAlbumSchema.safeParse({
        groomName: "Joni",
        brideName: "Astu",
        weddingDate: "03 MAY 2026",
        location: "Addis Ababa",
      }).success
    ).toBe(true);
  });
});
