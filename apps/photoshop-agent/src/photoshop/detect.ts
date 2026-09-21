import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { getAgentEnv } from "@wedding/config/agent";
import { logger } from "../logger";

export interface PhotoshopInfo {
  available: boolean;
  version: string | null;
  exePath: string | null;
  reason: string | null;
}

/**
 * Detect Photoshop 2022 on Windows:
 *  1. PHOTOSHOP_PATH from the agent .env
 *  2. Standard install roots (C:\Program Files\Adobe\Adobe Photoshop 2022\…)
 * COM detection (creating Photoshop.Application) launches Photoshop, so it is
 * deliberately NOT used during passive detection — only when running jobs.
 */
export function detectPhotoshop(): PhotoshopInfo {
  const env = getAgentEnv();

  if (process.platform !== "win32") {
    return {
      available: false,
      version: null,
      exePath: null,
      reason:
        "Photoshop COM automation requires Windows. Use AGENT_PHOTOSHOP_MODE=DRYRUN for pipeline testing only.",
    };
  }

  const candidates: string[] = [];
  if (env.PHOTOSHOP_PATH) candidates.push(env.PHOTOSHOP_PATH);

  const roots = ["C:\\Program Files\\Adobe", "C:\\Program Files (x86)\\Adobe"];
  for (const root of roots) {
    try {
      if (!existsSync(root)) continue;
      for (const entry of readdirSync(root)) {
        if (/Adobe Photoshop/i.test(entry)) {
          candidates.push(path.join(root, entry, "Photoshop.exe"));
        }
      }
    } catch {
      /* permission — ignore */
    }
  }

  for (const exe of candidates) {
    try {
      if (existsSync(exe) && statSync(exe).isFile()) {
        const version = env.PHOTOSHOP_VERSION;
        logger.info(`Photoshop detected: ${exe}`);
        return { available: true, version, exePath: exe, reason: null };
      }
    } catch {
      /* continue */
    }
  }

  return {
    available: false,
    version: null,
    exePath: null,
    reason: `Photoshop ${env.PHOTOSHOP_VERSION} not found. Set PHOTOSHOP_PATH in apps/photoshop-agent/.env.`,
  };
}

/** ProgID for COM. Photoshop 2022 = internal v23 → "Photoshop.Application.160". */
export function photoshopProgId(version: string): string {
  const table: Record<string, string> = {
    "2022": "Photoshop.Application.160",
    "2021": "Photoshop.Application.150",
    "2023": "Photoshop.Application.170",
    "2024": "Photoshop.Application.180",
  };
  return table[version] ?? "Photoshop.Application";
}
