import { promises as fs } from "node:fs";
import path from "node:path";
import { getAgentEnv } from "@wedding/config/agent";

import { AgentJobPayloadSchema, type AgentJobPayload } from "@wedding/validation";
import { sendReport, uploadOutput, type OutputMeta } from "./report";
import { createPhotoshopAdapter } from "./photoshop/factory";
import type { PhotoshopAdapter } from "./photoshop/adapter";
import { writeJobFiles } from "./photoshop/jsx-bridge";
import { pollProgress } from "./progress";
import { broadcastEvent } from "./local-service";
import { state, resetBusy } from "./state";
import { acquireInput, checkDiskSpace } from "./inputs";
import { logger } from "./logger";

/**
 * The adapter is chosen from AGENT_PHOTOSHOP_MODE, which comes from
 * apps/photoshop-agent/.env and is loaded by loadAgentDotEnv() inside main().
 * Module imports are evaluated before main() runs, so creating the adapter at
 * module scope would read the env too early and fail validation. Create it
 * lazily on first use instead.
 */
let adapter: PhotoshopAdapter | null = null;

function getAdapter(): PhotoshopAdapter {
  adapter ??= createPhotoshopAdapter();
  return adapter;
}

const env = () => getAgentEnv();

export function photoshopMode(): "COM" | "DRYRUN" {
  return getAdapter().mode;
}

export async function ensurePhotoshopSession(): Promise<void> {
  const version = await getAdapter().open();
  if (version) state.photoshopVersion = version;
}

/**
 * Execute one claimed job end-to-end:
 * claim payload → acquire input → open Photoshop → run JSX → poll progress →
 * upload outputs → report terminal status.
 */
export async function executeJob(raw: unknown): Promise<void> {
  const job = AgentJobPayloadSchema.parse(raw);
  state.busy = true;
  state.activeJobId = job.jobId;

  const jobDir = path.resolve(env().AGENT_WORKSPACE_PATH, "jobs", job.jobId);
  const outDir = path.resolve(env().AGENT_WORKSPACE_PATH, "outputs", job.jobId);

  try {
    await checkDiskSpace();
    await fs.mkdir(jobDir, { recursive: true });
    await fs.mkdir(outDir, { recursive: true });

    const acquired = await acquireInput(job, jobDir);
    const runJob: AgentJobPayload = {
      ...job,
      inputPath: acquired.inputPath,
      albumInputs: acquired.albumInputs,
      outputDir: outDir,
      templatesDir: path.resolve(env().AGENT_WORKSPACE_PATH, "templates"),
      tempDir: path.join(jobDir, "temp"),
    };

    await step(runJob.jobId, "PROCESSING", 5, "Preparing files");
    await step(runJob.jobId, "PHOTOSHOP_OPENING", 10, "Opening Adobe Photoshop");
    await ensurePhotoshopSession();

    const paths = await writeJobFiles(jobDir, runJob);
    const scriptsDir = path.resolve(__dirname, "..", "scripts");
    const scriptName = job.operation === "CREATE_ALBUM" ? "create-album.jsx" : "edit-photo.jsx";

    await step(runJob.jobId, "EDITING", 15, "Photoshop is editing");

    let done = false;
    const poller = pollProgress(paths.progressPath, runJob.jobId, () => done);
    let result;
    try {
      result = await Promise.race([
        getAdapter().run({ job: runJob, paths, scriptsDir, scriptName }),
        poller.expired,
      ]);
    } finally {
      done = true;
      poller.stop();
    }

    if (!result) {
      throw Object.assign(new Error("Photoshop did not finish in time"), { code: "JOB_TIMEOUT" });
    }
    if (!result.ok) {
      throw Object.assign(new Error(result.errorMessage || result.errorCode), {
        code: result.errorCode || "JSX_ERROR",
      });
    }

    await step(runJob.jobId, "EXPORTING", 92, "Uploading outputs");

    const outputMetas: OutputMeta[] = [];
    for (const output of result.outputs ?? []) {
      const localPath = path.join(outDir, output.fileName);
      try {
        await fs.access(localPath);
      } catch {
        logger.warn(`Expected output missing on disk: ${localPath}`);
        continue;
      }
      const stat = await fs.stat(localPath);
      const meta: OutputMeta = {
        fileName: output.fileName,
        format: output.format,
        fileSize: stat.size,
        width: output.width,
        height: output.height,
        dpi: output.dpi,
        colorMode: output.colorMode,
        pageTemplateKey: output.pageTemplateKey ?? null,
      };
      await uploadOutput(runJob.jobId, localPath, meta);
      outputMetas.push(meta);
    }

    await sendReport({
      jobId: runJob.jobId,
      terminal: true,
      status: "COMPLETED",
      errorCode: "OK",
      errorMessage: "",
      outputs: outputMetas,
      localOutputDir: outDir,
    });
    broadcastEvent({
      type: "progress",
      jobId: runJob.jobId,
      status: "COMPLETED",
      progress: 100,
      message: "Photoshop finished",
      at: new Date().toISOString(),
    });
    logger.info(`Job ${runJob.jobId} completed with ${outputMetas.length} output(s)`);
  } catch (err) {
    await reportFailure(job.jobId, err);
  } finally {
    resetBusy();
  }
}

async function step(
  jobId: string,
  status: "PROCESSING" | "PHOTOSHOP_OPENING" | "EDITING" | "EXPORTING",
  progress: number,
  message: string
): Promise<void> {
  await sendReport({ jobId, terminal: false, status, progress, message });
  broadcastEvent({
    type: "progress",
    jobId,
    status,
    progress,
    message,
    at: new Date().toISOString(),
  });
}

async function reportFailure(jobId: string, err: unknown): Promise<void> {
  const code = (err as { code?: string }).code || "UNKNOWN";
  const message = err instanceof Error ? err.message : String(err);
  logger.error(`Job failed (${code}): ${message}`);
  try {
    await sendReport({
      jobId,
      terminal: true,
      status: "FAILED",
      errorCode: code,
      errorMessage: message,
      outputs: [],
      localOutputDir: "",
    });
    broadcastEvent({
      type: "progress",
      jobId,
      status: "FAILED",
      progress: 100,
      message,
      at: new Date().toISOString(),
    });
  } catch (reportErr) {
    logger.error("Could not report failure to server:", reportErr);
  }
}

export async function gracefulShutdown(): Promise<void> {
  if (!adapter) return; // nothing was ever opened — no session to close
  await adapter.close();
}
