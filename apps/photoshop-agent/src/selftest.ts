/**
 * Photoshop pipeline self-test (README §26):
 *   1. create a test JPG in Photoshop
 *   2. open it, apply the ELEGANT_WEDDING preset
 *   3. save a PSD
 *   4. export a JPG
 *   5. verify the files exist
 *
 * Run with:  npm run selftest   (inside apps/photoshop-agent)
 * Exits 0 when every step passed, 1 otherwise.
 * On non-Windows machines (or AGENT_PHOTOSHOP_MODE=DRYRUN) it reports clearly
 * that PHOTOSHOP WAS NOT TESTED and simulates the flow instead.
 */
import path from "node:path";
import { promises as fs } from "node:fs";
import { getAgentEnv } from "@wedding/config/agent";
import { getPreset } from "@wedding/config";
import { ComPhotoshopAdapter } from "./photoshop/com-adapter";
import { DryRunAdapter } from "./photoshop/dry-run-adapter";
import { writeJobFiles } from "./photoshop/jsx-bridge";
import { logger } from "./logger";
import type { PhotoshopRunResult } from "./photoshop/adapter";

export async function runSelftest(): Promise<boolean> {
  const env = getAgentEnv();
  const workspace = path.resolve(env.AGENT_WORKSPACE_PATH, "selftest");
  await fs.mkdir(workspace, { recursive: true });

  const useRealPhotoshop = process.platform === "win32" && env.AGENT_PHOTOSHOP_MODE !== "DRYRUN";
  const paths = await writeJobFiles(workspace, {
    jobId: "selftest",
    dbJobId: "selftest",
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
  });

  const adapter = useRealPhotoshop ? new ComPhotoshopAdapter() : new DryRunAdapter();

  logger.info(
    useRealPhotoshop
      ? "SELFTEST: running against REAL Adobe Photoshop"
      : "⚠️  SELFTEST: PHOTOSHOP WILL NOT BE TESTED (DRY RUN simulation only)"
  );

  const scriptsDir = path.resolve(__dirname, "..", "scripts");
  const result: PhotoshopRunResult = await adapter.run({
    job: { jobId: "selftest" } as never,
    paths,
    scriptsDir,
    scriptName: "edit-photo.jsx",
  });

  if (!result.ok) {
    logger.error(`SELFTEST FAILED: ${result.errorCode} — ${result.errorMessage}`);
    return false;
  }

  // Verify the produced files really exist (skipped for DRY RUN which writes none).
  if (useRealPhotoshop) {
    const expected = ["selftest_edited.psd", "selftest_edited.jpg"];
    for (const file of expected) {
      try {
        const stat = await fs.stat(path.join(workspace, file));
        if (stat.size === 0) throw new Error(`${file} is empty`);
        logger.info(`SELFTEST OK: ${file} (${stat.size} bytes)`);
      } catch (err) {
        logger.error(`SELFTEST FAILED: expected output missing — ${(err as Error).message}`);
        return false;
      }
    }
  } else {
    logger.warn("DRY RUN selftest completed — NO Photoshop files were produced.");
  }

  logger.info("SELFTEST PASSED");
  return true;
}
