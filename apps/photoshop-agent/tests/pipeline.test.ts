import { describe, it, expect, beforeAll } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DryRunAdapter } from "../src/photoshop/dry-run-adapter";
import { ComPhotoshopAdapter } from "../src/photoshop/com-adapter";
import { writeJobFiles } from "../src/photoshop/jsx-bridge";
import type { AgentJobPayload } from "@wedding/validation";

beforeAll(() => {
  process.env.AGENT_TOKEN = process.env.AGENT_TOKEN || "test-agent-token-0123456789";
  process.env.SERVER_URL = process.env.SERVER_URL || "http://127.0.0.1:59999";
});

function payload(overrides: Partial<AgentJobPayload> = {}): AgentJobPayload {
  return {
    jobId: "job-dry-1",
    dbJobId: "db-1",
    operation: "EDIT_PHOTO",
    inputPath: null,
    inputUrl: null,
    photoId: "p1",
    photoName: "IMG_0001.JPG",
    extension: "jpg",
    presetKey: "ELEGANT_WEDDING",
    presetParams: {
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
    outputFormats: ["JPG"],
    quality: "HIGH",
    colorMode: "RGB",
    dpi: 300,
    album: null,
    albumInputs: {},
    outputDir: "",
    templatesDir: "",
    tempDir: "",
    outputUploadUrl: "-",
    reportUrl: "-",
    ...overrides,
  };
}

describe("DryRunAdapter (clearly labelled simulation — NOT Photoshop)", () => {
  it("simulates the pipeline and writes progress events, but produces NO outputs", async () => {
    const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "wps-dry-"));
    const paths = await writeJobFiles(workspace, payload());
    const scriptsDir = path.resolve(__dirname, "..", "scripts");
    const adapter = new DryRunAdapter();

    const result = await adapter.run({ job: payload(), paths, scriptsDir, scriptName: "edit-photo.jsx" });

    expect(result.ok).toBe(true);
    // Honest dry-run: never fabricates a "professional edit"
    expect(result.outputs).toEqual([]);

    const progressRaw = await fs.readFile(paths.progressPath, "utf8");
    const progress = JSON.parse(progressRaw);
    expect(progress.jobId).toBe("job-dry-1");
    expect(progress.progress).toBeGreaterThan(50);
    expect(progress.message).toMatch(/DRY RUN/i);
  });
});

describe("ComPhotoshopAdapter worker protocol", () => {
  it("reports a clean PS_NOT_INSTALLED result when the COM bridge is unavailable", async () => {
    // On Linux CI winax cannot be required — the worker must fail with a
    // structured result file (never crash the agent or fake success).
    if (process.platform === "win32") return; // real COM path tested by the e2e suite
    const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "wps-com-"));
    const paths = await writeJobFiles(workspace, payload());
    const scriptsDir = path.resolve(__dirname, "..", "scripts");
    const adapter = new ComPhotoshopAdapter();

    const result = await adapter.run({
      job: payload(),
      paths,
      scriptsDir,
      scriptName: "edit-photo.jsx",
    });

    expect(result.ok).toBe(false);
    expect(["PS_NOT_INSTALLED", "PS_ERROR", "PS_NOT_RUNNING"]).toContain(result.errorCode);
  }, 20_000);
});
