import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { getServerEnv } from "@wedding/config/server";

/**
 * Agent authentication.
 * The agent authenticates with `Authorization: Bearer <AGENT_TOKEN>`.
 * The comparison is timing-safe; the token hash is stored on the Agent row.
 */
export function hashAgentToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(presented: string, expected: string): boolean {
  const a = Buffer.from(hashAgentToken(presented));
  const b = Buffer.from(hashAgentToken(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function extractBearerToken(request: NextRequest | Request): string | null {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

/** Returns the agent token hash when valid, or null when unauthorised. */
export function authenticateAgent(request: NextRequest | Request): string | null {
  const token = extractBearerToken(request);
  if (!token) return null;
  const expected = process.env.AGENT_TOKEN || getServerEnv().AGENT_TOKEN;
  return tokensMatch(token, expected) ? hashAgentToken(expected) : null;
}
