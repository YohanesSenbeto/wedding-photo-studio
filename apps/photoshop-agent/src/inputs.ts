import { promises as fs } from "node:fs";
import path from "node:path";
import { statfs } from "node:fs/promises";
import { getAgentEnv } from "@wedding/config/agent";
import type { AgentJobPayload } from "@wedding/validation";
import { downloadFile } from "./report";
import { state } from "./state";

/**
 * Input acquisition.
 * - EDIT_PHOTO: use the shared filesystem path when available (server and
 *   agent on one machine), otherwise download the original via the server.
 * - CREATE_ALBUM: download every assigned slot photo into the job workspace
 *   and hand a photoId → local path map to the JSX.
 */
export async function acquireInput(
  job: AgentJobPayload,
  jobDir: string
): Promise<{ inputPath: string; albumInputs: Record<string, string> }> {
  if (job.operation === "CREATE_ALBUM") {
    const albumInputs: Record<string, string> = {};
    const urls = new Map<string, string>();
    for (const page of job.album?.pages ?? []) {
      for (const slot of page.slots) {
        if (slot.photoId && slot.photoUrl) urls.set(slot.photoId, slot.photoUrl);
      }
    }
    const dir = path.join(jobDir, "album-inputs");
    await fs.mkdir(dir, { recursive: true });
    for (const [photoId, url] of urls) {
      const ext = photoExtension(job, photoId, url);
      const dest = path.join(dir, `${photoId}.${ext}`);
      await downloadFile(url, dest);
      albumInputs[photoId] = dest;
    }
    return { inputPath: "-", albumInputs };
  }

  const canonicalExt = job.extension.toLowerCase();
  if (canonicalExt !== "jpg" && canonicalExt !== "jpeg" && canonicalExt !== "arw") {
    throw Object.assign(
      new Error(`Unsupported single-photo extension for job: ${canonicalExt}`),
      { code: "INVALID_INPUT" }
    );
  }

  if (job.inputPath && (await existsOnDisk(job.inputPath))) {
    return { inputPath: job.inputPath, albumInputs: {} };
  }
  if (job.inputUrl) {
    const dest = path.join(jobDir, `input.${canonicalExt === "jpeg" ? "jpg" : canonicalExt}`);
    await downloadFile(job.inputUrl, dest);
    return { inputPath: dest, albumInputs: {} };
  }
  throw Object.assign(new Error("No input available for job"), { code: "INVALID_INPUT" });
}

function photoExtension(
  job: AgentJobPayload,
  photoId: string,
  url: string
): "jpg" | "jpeg" | "arw" {
  const urlExt = urlSplitExt(url);
  if (urlExt === "jpg" || urlExt === "jpeg" || urlExt === "arw") return urlExt;
  // Match by photo id when the URL does not carry the real extension (e.g. signed
  // storage URLs). This keeps album downloads deterministic across servers.
  for (const page of job.album?.pages ?? []) {
    for (const slot of page.slots) {
      if (slot.photoId === photoId && slot.photoUrl === url) {
        return job.extension.toLowerCase() === "jpeg" ? "jpg" : job.extension.toLowerCase() as "jpg" | "arw";
      }
    }
  }
  // Safer fallback than a mangled URL path — never derive the file type from a
  // query string or a rewrite that may hide the real extension.
  return "jpg";
}

function urlSplitExt(url: string): "jpg" | "jpeg" | "arw" | "unknown" {
  const clean = url.split("?")[0].split("#")[0];
  if (!clean.includes(".")) return "unknown";
  const ext = clean.slice(clean.lastIndexOf(".") + 1).toLowerCase();
  if (ext === "jpg" || ext === "jpeg" || ext === "arw") return ext as "jpg" | "jpeg" | "arw";
  return "unknown";
}

async function existsOnDisk(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** Fail fast when the workspace disk is nearly full. */
export async function checkDiskSpace(): Promise<void> {
  try {
    const root = path.resolve(getAgentEnv().AGENT_WORKSPACE_PATH);
    await fs.mkdir(root, { recursive: true });
    const stats = await statfs(root);
    const free = stats.bsize * stats.bavail;
    state.diskFreeBytes = free;
    if (free < getAgentEnv().MIN_FREE_DISK_MB * 1024 * 1024) {
      throw Object.assign(new Error("Not enough free disk space"), { code: "DISK_FULL" });
    }
  } catch (err) {
    if ((err as { code?: string }).code === "DISK_FULL") throw err;
    // statfs unsupported here — skip the check instead of failing jobs.
  }
}
