import type { PrismaClient } from "@prisma/client";
import { ACTIVE_STATUSES } from "./jobs";
import { getFriendlyError } from "@wedding/config";

/**
 * Lazy maintenance sweep — runs opportunistically whenever the agent or the
 * UI talks to job-related endpoints:
 *  - Jobs whose agent stopped reporting for > STALE_JOB_MINUTES fail with
 *    JOB_TIMEOUT / AGENT_DISCONNECTED.
 *  - Agents that stopped heart-beating for > AGENT_OFFLINE_SECONDS go OFFLINE.
 */
export const STALE_JOB_MINUTES = 30;
export const AGENT_OFFLINE_SECONDS = 90;

export async function sweepStaleJobs(prisma: PrismaClient): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_JOB_MINUTES * 60_000);
  try {
    await prisma.editingJob.updateMany({
      where: {
        status: { in: ACTIVE_STATUSES },
        updatedAt: { lt: cutoff },
      },
      data: {
        status: "FAILED",
        errorCode: "JOB_TIMEOUT",
        errorMessage: `No agent update for over ${STALE_JOB_MINUTES} minutes`,
        completedAt: new Date(),
      },
    });
  } catch (e) {
    console.error("[sweep] failed", e);
  }
}

export async function sweepOfflineAgents(prisma: PrismaClient): Promise<void> {
  const cutoff = new Date(Date.now() - AGENT_OFFLINE_SECONDS * 1000);
  try {
    const res = await prisma.agent.updateMany({
      where: { status: { not: "OFFLINE" }, lastSeenAt: { lt: cutoff } },
      data: { status: "OFFLINE", activeJobId: null },
    });
    if (res.count > 0) {
      // Any job assigned to an offline agent for too long is failed above by
      // sweepStaleJobs; here we only flip presence state.
      console.log(`[sweep] ${res.count} agent(s) marked offline`);
    }
  } catch (e) {
    console.error("[sweep] agent sweep failed", e);
  }
}

export function friendlyTimeoutError(): { errorCode: string; errorMessage: string } {
  return {
    errorCode: "AGENT_DISCONNECTED",
    errorMessage: getFriendlyError("AGENT_DISCONNECTED"),
  };
}
