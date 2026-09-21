import { sleep } from "./util";
import { readProgress } from "./photoshop/jsx-bridge";
import { sendReport } from "./report";
import { broadcastEvent } from "./local-service";
import { getAgentEnv } from "@wedding/config/agent";
import { logger } from "./logger";

export type ActiveStatus = "PROCESSING" | "PHOTOSHOP_OPENING" | "EDITING" | "EXPORTING";

const ALLOWED: readonly string[] = ["PROCESSING", "PHOTOSHOP_OPENING", "EDITING", "EXPORTING"];

export function normalizeStatus(status: string): ActiveStatus {
  return (ALLOWED.includes(status) ? status : "EDITING") as ActiveStatus;
}

export interface Poller {
  stop: () => void;
  expired: Promise<null>;
}

/**
 * Poll the JSX progress file and mirror status/progress to the server and
 * the local WebSocket hub while the blocking Photoshop call runs elsewhere.
 */
export function pollProgress(
  progressPath: string,
  jobId: string,
  isDone: () => boolean
): Poller {
  let stopped = false;
  let lastProgress = -1;
  let lastStatus = "";
  const expired = new Promise<null>((resolve) => {
    const deadline = Date.now() + getAgentEnv().JOB_TIMEOUT_SECONDS * 1000;
    const tick = async () => {
      if (stopped) return;
      if (Date.now() > deadline) {
        resolve(null);
        return;
      }
      if (isDone()) return;
      const snapshot = await readProgress(progressPath);
      if (snapshot && (snapshot.progress !== lastProgress || snapshot.status !== lastStatus)) {
        lastProgress = snapshot.progress;
        lastStatus = snapshot.status;
        logger.info(`job ${jobId}: ${snapshot.status} ${snapshot.progress}%`);
        try {
          await sendReport({
            jobId,
            terminal: false,
            status: normalizeStatus(snapshot.status),
            progress: snapshot.progress,
            message: snapshot.message ?? "",
          });
        } catch {
          /* keep editing even if a progress report fails */
        }
        broadcastEvent({
          type: "progress",
          jobId,
          status: normalizeStatus(snapshot.status),
          progress: snapshot.progress,
          message: snapshot.message ?? "",
          at: new Date().toISOString(),
        });
      }
      await sleep(2000);
      tick();
    };
    void tick();
  });
  return {
    stop: () => (stopped = true),
    expired,
  };
}
