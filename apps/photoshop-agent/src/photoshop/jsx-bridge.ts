import { promises as fs } from "node:fs";
import path from "node:path";
import type { JobScriptPaths } from "./adapter";
import type { AgentJobPayload } from "@wedding/validation";

export interface ProgressSnapshot {
  jobId: string;
  status: string;
  progress: number;
  message?: string;
  at?: string;
}

/** Prepare params/progress/result files for a JSX run. */
export async function writeJobFiles(
  jobDir: string,
  job: AgentJobPayload
): Promise<JobScriptPaths> {
  await fs.mkdir(jobDir, { recursive: true });
  const paths: JobScriptPaths = {
    paramsPath: path.join(jobDir, "params.json"),
    resultPath: path.join(jobDir, "result.json"),
    progressPath: path.join(jobDir, "progress.json"),
  };
  await fs.writeFile(paths.paramsPath, JSON.stringify(job, null, 2), "utf8");
  await fs.rm(paths.resultPath, { force: true });
  await fs.rm(paths.progressPath, { force: true });
  return paths;
}

/** Non-destructive read of the JSX progress file. */
export async function readProgress(progressPath: string): Promise<ProgressSnapshot | null> {
  try {
    const raw = await fs.readFile(progressPath, "utf8");
    return JSON.parse(raw) as ProgressSnapshot;
  } catch {
    return null;
  }
}
