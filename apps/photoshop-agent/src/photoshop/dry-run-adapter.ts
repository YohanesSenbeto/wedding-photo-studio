import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { sleep } from "../util";
import { logger } from "../logger";
import type { JobScriptPaths, PhotoshopAdapter, PhotoshopRunResult } from "./adapter";
import type { AgentJobPayload } from "@wedding/validation";

/**
 * ⚠️  DRY RUN — THIS IS NOT PHOTOSHOP ⚠️
 *
 * Simulates the job lifecycle (open → edit → export) so the full pipeline
 * (queue → claim → report → output upload) can be developed and tested on
 * machines WITHOUT Photoshop (e.g. CI on Linux).
 *
 * It never produces image files and its logs always say "DRY RUN".
 * Enable with AGENT_PHOTOSHOP_MODE=DRYRUN.
 */
export class DryRunAdapter implements PhotoshopAdapter {
  readonly mode = "DRYRUN" as const;

  async open(): Promise<string | null> {
    logger.warn("DRY RUN — NOT PHOTOSHOP: 'opening' simulated Photoshop session");
    await sleep(300);
    // Return null on purpose: no real Photoshop version exists here, and
    // reporting a fake one would mislead the server/UI (the DRYRUN state is
    // already conveyed by the agent's `photoshopMode`).
    return null;
  }

  async run(params: {
    job: AgentJobPayload;
    paths: JobScriptPaths;
    scriptsDir: string;
    scriptName: string;
  }): Promise<PhotoshopRunResult> {
    logger.warn(
      `DRY RUN — NOT PHOTOSHOP: simulating ${params.job.operation} for job ${params.job.jobId} (${params.job.photoName})`
    );
    const stages: [string, number, number][] = [
      ["PHOTOSHOP_OPENING", 10, 400],
      ["EDITING", 40, 600],
      ["EDITING", 65, 600],
      ["EXPORTING", 85, 500],
    ];
    for (const [status, progress, ms] of stages) {
      await sleep(ms);
      writeProgress(params.paths.progressPath, {
        jobId: params.job.jobId,
        status,
        progress,
        message: "DRY RUN (no Photoshop)",
        at: new Date().toISOString(),
      });
    }
    await sleep(300);

    // NOTE: no real image output — a dry run must never fake a "professional edit".
    // Return a shape compatible with runner.ts expectation: runner.executes a job by
    // calling writeJobFiles() first, then calling adapter.run({ paths, scriptName, job }).
    // Some callers (e.g. selftest) pass only { job } within the generic parameter, but
    // the DryRunAdapter ignores extra fields here.
    return {
      ok: true,
      errorCode: "",
      errorMessage: "",
      outputs: [],
      documentWidth: 1200,
      documentHeight: 800,
    };
  }

  async close(): Promise<void> {
    /* nothing to close */
  }
}

function writeProgress(progressPath: string, data: unknown): void {
  try {
    mkdirSync(path.dirname(progressPath), { recursive: true });
    writeFileSync(progressPath, JSON.stringify(data));
  } catch {
    /* best effort */
  }
}
