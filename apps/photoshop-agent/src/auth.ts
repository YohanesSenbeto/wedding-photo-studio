import { createHash, timingSafeEqual } from "node:crypto";
import { getAgentEnv } from "@wedding/config/agent";

/** Timing-safe comparison of the presented token against the configured one. */
export function authenticateToken(presented: string | null | undefined): boolean {
  if (!presented) return false;
  const expected = getAgentEnv().AGENT_TOKEN;
  const a = sha256(presented);
  const b = sha256(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}
