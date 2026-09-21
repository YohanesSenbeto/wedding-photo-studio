import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getAgentEnv, type AgentEnv } from "@wedding/config/agent";

/**
 * Loads apps/photoshop-agent/.env (if present) into process.env without
 * overriding values that are already set, then validates via @wedding/config.
 */
export function loadAgentDotEnv(): void {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function agentConfig(): AgentEnv {
  return getAgentEnv();
}

export const APP_VERSION = "1.0.0";
export const AGENT_NAME = "Wedding Photoshop Agent";
