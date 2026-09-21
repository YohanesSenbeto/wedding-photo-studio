import os from "node:os";
import { getAgentEnv } from "@wedding/config/agent";
import { claimJobs, registerAgent, sendHeartbeat } from "./server-client";
import { executeJob, ensurePhotoshopSession, photoshopMode } from "./runner";
import { state } from "./state";
import { detectPhotoshop } from "./photoshop/detect";
import { APP_VERSION, AGENT_NAME } from "./config";
import { logger } from "./logger";
import { sleep } from "./util";

let stopped = false;

export function stopAgentLoop(): void {
  stopped = true;
}

/**
 * Main agent loop:
 *   register → [heartbeat interval] → claim → execute → report → repeat.
 * Jobs are processed strictly one at a time (Photoshop is a single user).
 */
export async function runAgentLoop(): Promise<void> {
  const env = getAgentEnv();
  const psInfo = detectPhotoshop();
  state.photoshopAvailable = psInfo.available && photoshopMode() === "COM";
  state.photoshopVersion = psInfo.version;

  let registered = false;
  let backoffMs = 0;

  const heartbeat = setInterval(() => {
    void sendHeartbeat({
      status: state.busy ? "BUSY" : "ONLINE",
      activeJobId: state.activeJobId,
      photoshopAvailable: state.photoshopAvailable,
      photoshopVersion: state.photoshopVersion,
      diskFreeBytes: state.diskFreeBytes,
    }).catch((err) => logger.warn(`heartbeat failed: ${err.message}`));
  }, 15_000);

  logger.info(
    `Agent starting — mode=${photoshopMode()} photoshop=${state.photoshopAvailable ? "detected" : "not detected"}`
  );
  if (!state.photoshopAvailable) {
    logger.warn("Photoshop is NOT available — the agent will run in DRY RUN (simulation) mode.");
    logger.warn(psInfo.reason ?? "");
  }

  try {
    await ensurePhotoshopSession();
  } catch (err) {
    logger.warn(`Photoshop session could not be started yet: ${(err as Error).message}`);
    logger.warn("Jobs will still be claimed; PS_NOT_INSTALLED errors will be reported per job.");
  }

  while (!stopped) {
    try {
      if (!registered) {
        await registerAgent({
          name: AGENT_NAME,
          machineName: os.hostname(),
          platform: `${process.platform} ${process.arch}`,
          appVersion: APP_VERSION,
          photoshopVersion: state.photoshopVersion,
          photoshopAvailable: state.photoshopAvailable,
          photoshopMode: photoshopMode(),
        });
        registered = true;
        backoffMs = 0;
        logger.info("Registered with the studio server");
      }

      if (!state.busy) {
        const jobs = await claimJobs(1);
        for (const job of jobs) {
          await executeJob(job);
        }
      }
      backoffMs = 0;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (backoffMs === 0) logger.warn(`server unreachable (${message}) — retrying with backoff`);
      backoffMs = Math.min(30_000, backoffMs + 2_000);
      if (message.includes("token")) registered = false; // re-register after auth fixes
    }
    await sleep(Math.max(env.JOB_POLL_INTERVAL_MS, backoffMs));
  }

  clearInterval(heartbeat);
  logger.info("Agent loop stopped");
}
