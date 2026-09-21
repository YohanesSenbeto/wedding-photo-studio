import { getAgentEnv } from "@wedding/config/agent";
import { detectPhotoshop } from "./detect";
import { ComPhotoshopAdapter } from "./com-adapter";
import { DryRunAdapter } from "./dry-run-adapter";
import { logger } from "../logger";
import type { PhotoshopAdapter } from "./adapter";

/**
 * Picks the Photoshop adapter.
 *  - AGENT_PHOTOSHOP_MODE=COM    → real Photoshop (Windows + winax required)
 *  - AGENT_PHOTOSHOP_MODE=DRYRUN → labelled simulator (no Photoshop)
 *  - AGENT_PHOTOSHOP_MODE=AUTO   → COM on Windows, DRYRUN elsewhere (with a loud warning)
 */
export function createPhotoshopAdapter(): PhotoshopAdapter {
  const env = getAgentEnv();
  const info = detectPhotoshop();

  let mode: "COM" | "DRYRUN";
  if (env.AGENT_PHOTOSHOP_MODE === "COM") mode = "COM";
  else if (env.AGENT_PHOTOSHOP_MODE === "DRYRUN") mode = "DRYRUN";
  else mode = process.platform === "win32" && info.available ? "COM" : "DRYRUN";

  if (mode === "COM") {
    logger.info("Photoshop adapter: COM (real Adobe Photoshop automation)");
    return new ComPhotoshopAdapter();
  }

  if (env.AGENT_PHOTOSHOP_MODE !== "DRYRUN") {
    logger.warn("Photoshop unavailable on this machine — falling back to DRY RUN mode.");
    logger.warn(info.reason ?? "");
  }
  logger.warn("DRY RUN mode is NOT Photoshop and produces no edited images.");
  return new DryRunAdapter();
}
