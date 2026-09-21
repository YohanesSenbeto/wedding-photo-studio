import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { photoshopProgId } from "./detect";
import { logger } from "../logger";
import type { JobScriptPaths, PhotoshopAdapter, PhotoshopRunResult } from "./adapter";
import type { AgentJobPayload } from "@wedding/validation";

/**
 * REAL Photoshop automation via COM (winax) running in a forked CommonJS
 * child process (`workers/com-runner.js`), because:
 *  1. winax is a native module that only builds on Windows;
 *  2. COM/DoJavaScript calls block — running them in a child process keeps
 *     the agent event loop free so it can poll the progress file that the
 *     ExtendScript writes, keep heart-beating and report to the server.
 *
 * Protocol (all files inside the job workspace dir):
 *   params.json    — job payload written by the agent
 *   progress.json  — written by the JSX at each pipeline milestone
 *   result.json    — written by the JSX on success/failure
 */
export class ComPhotoshopAdapter implements PhotoshopAdapter {
  readonly mode = "COM" as const;
  private workerPath = path.resolve(__dirname, "..", "..", "workers", "com-runner.js");

  async open(): Promise<string | null> {
    if (process.platform !== "win32") {
      const err = new Error("PS_NOT_INSTALLED: Photoshop COM automation requires Windows");
      (err as Error & { code: string }).code = "PS_NOT_INSTALLED";
      throw err;
    }
    // Photoshop is launched implicitly by creating the COM object in the worker.
    return null;
  }

  async run(params: {
    job: AgentJobPayload;
    paths: JobScriptPaths;
    scriptsDir: string;
    scriptName: string;
  }): Promise<PhotoshopRunResult> {
    const progId = photoshopProgId(process.env.PHOTOSHOP_VERSION || "2022");
    const scriptsDir = path.resolve(__dirname, "..", "..", "scripts");
    const bootstrap = buildBootstrap(params.paths, scriptsDir, params.scriptName);

    return new Promise<PhotoshopRunResult>((resolve, reject) => {
      const child = spawn(process.execPath, [this.workerPath], {
        stdio: ["ignore", "inherit", "inherit"],
        env: {
          ...process.env,
          WPS_PROG_ID: progId,
          WPS_BOOTSTRAP_JSX: bootstrap,
          WPS_RESULT_PATH: params.paths.resultPath,
        },
      });

      const timeoutMs = Number(process.env.JOB_TIMEOUT_SECONDS || 1200) * 1000;
      const timeout = setTimeout(() => {
        child.kill();
        const err = new Error("JOB_TIMEOUT: Photoshop did not finish in time");
        (err as Error & { code: string }).code = "JOB_TIMEOUT";
        reject(err);
      }, timeoutMs);

      child.on("exit", (code) => {
        clearTimeout(timeout);
        const result = tryReadResult(params.paths.resultPath);
        if (result) {
          logger.info(`Photoshop job result: ${result.ok ? "OK" : result.errorCode}`);
          resolve(result);
          return;
        }
        const err = new Error(`JSX_ERROR: worker exited with code ${code} without a result file`);
        (err as Error & { code: string }).code = "JSX_ERROR";
        reject(err);
      });

      child.on("error", (err) => {
        clearTimeout(timeout);
        const e = new Error(`PS_NOT_INSTALLED: ${err.message}`);
        (e as Error & { code: string }).code = "PS_NOT_INSTALLED";
        reject(e);
      });
    });
  }

  async close(): Promise<void> {
    /* Photoshop intentionally stays open between jobs (studio session). */
  }
}

/**
 * The ExtendScript bootstrap executed through app.DoJavaScript().
 * ExtendScript is ES3: no let/const/arrow functions — plain ES3 only.
 */
function buildBootstrap(paths: JobScriptPaths, scriptsDir: string, scriptName: string): string {
  const p = (v: string) => v.replace(/\\/g, "/");
  return [
    `var WPS_BOOTSTRAP = {`,
    `  paramsPath: "${p(paths.paramsPath)}",`,
    `  resultPath: "${p(paths.resultPath)}",`,
    `  progressPath: "${p(paths.progressPath)}",`,
    `  scriptsDir: "${p(scriptsDir)}",`,
    `  scriptName: "${scriptName}"`,
    `};`,
    `try {`,
    `  $.evalFile(new File(WPS_BOOTSTRAP.scriptsDir + "/lib/common.jsx"));`,
    `  $.evalFile(new File(WPS_BOOTSTRAP.scriptsDir + "/" + WPS_BOOTSTRAP.scriptName));`,
    `  WPS.finish();`,
    `} catch (e) {`,
    `  WPS.fail("JSX_ERROR", (e && e.message ? e.message : String(e)) + " (line " + (e && e.line ? e.line : "?") + ")");`,
    `}`,
  ].join("\n");
}

function tryReadResult(resultPath: string): PhotoshopRunResult | null {
  try {
    if (!existsSync(resultPath)) return null;
    const raw = readFileSync(resultPath, "utf8");
    return JSON.parse(raw) as PhotoshopRunResult;
  } catch {
    return null;
  }
}
