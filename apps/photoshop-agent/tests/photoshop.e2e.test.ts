import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ComPhotoshopAdapter } from "../src/photoshop/com-adapter";
import { writeJobFiles } from "../src/photoshop/jsx-bridge";
import { getPreset } from "@wedding/config";
import type { AgentJobPayload } from "@wedding/validation";

/**
 * REAL PHOTOSHOP E2E TEST (README §26)
 *
 * 1. Open test JPG (created by selftest.jsx inside Photoshop)
 * 2. Apply preset (ELEGANT_WEDDING pipeline)
 * 3. Save PSD
 * 4. Export JPG
 * 5. Verify the files exist on disk
 *
 * GATED: runs ONLY on a Windows machine with Photoshop 2022 and
 * `RUN_PHOTOSHOP_TESTS=1`:
 *   PowerShell:  $env:RUN_PHOTOSHOP_TESTS="1"; npm test
 * Everywhere else it is skipped — it never fakes a result.
 */
const enabled =
  process.platform === "win32" && process.env.RUN_PHOTOSHOP_TESTS === "1";

function payload(workspace: string): AgentJobPayload {
  return {
    jobId: "e2e-selftest",
    dbJobId: "e2e-selftest",
    operation: "EDIT_PHOTO",
    inputPath: null,
    inputUrl: null,
    photoId: null,
    photoName: "selftest",
    extension: "jpg",
    presetKey: "ELEGANT_WEDDING",
    presetParams: getPreset("ELEGANT_WEDDING")!.params,
    outputFormats: ["PSD", "JPG"],
    quality: "HIGH",
    colorMode: "RGB",
    dpi: 300,
    album: null,
    albumInputs: {},
    outputDir: workspace,
    templatesDir: path.resolve(workspace, "templates"),
    tempDir: path.resolve(workspace, "temp"),
    outputUploadUrl: "-",
    reportUrl: "-",
  };
}

describe.skipIf(!enabled)("Photoshop 2022 pipeline (real application)", () => {
  it(
    "opens a JPG, applies a preset, saves PSD, exports JPG, verifies files",
    async () => {
      const workspace = path.resolve(__dirname, "..", "workspace", "e2e-test");
      await fs.mkdir(workspace, { recursive: true });
      const paths = await writeJobFiles(workspace, payload(workspace));
      const adapter = new ComPhotoshopAdapter();

      const result = await adapter.run({
        job: payload(workspace),
        paths,
        scriptsDir: path.resolve(__dirname, "..", "scripts"),
        scriptName: "edit-photo.jsx",
      });

      expect(result.ok, result.errorMessage).toBe(true);

      // 5. Verify the produced files exist and are non-trivial.
      const psd = await fs.stat(path.join(workspace, "selftest_edited.psd"));
      const jpg = await fs.stat(path.join(workspace, "selftest_edited.jpg"));
      expect(psd.size).toBeGreaterThan(10_000);
      expect(jpg.size).toBeGreaterThan(5_000);
    },
    240_000
  );
});
