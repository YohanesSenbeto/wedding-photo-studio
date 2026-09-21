import { NextRequest } from "next/server";
import { AgentHeartbeatSchema } from "@wedding/validation";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agent-auth";
import { jsonOk, toErrorResponse, ApiError } from "@/lib/http";
import { sweepStaleJobs, sweepOfflineAgents } from "@/lib/sweep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/agent/heartbeat — liveness + Photoshop state.
 * Also performs the lazy stale-job sweep while the agent is alive.
 */
export async function POST(request: NextRequest) {
  try {
    const tokenHash = authenticateAgent(request);
    if (!tokenHash) throw new ApiError("UNAUTHORIZED", "Invalid or missing agent token", 401);

    const body = AgentHeartbeatSchema.parse(await request.json());
    const agent = await prisma.agent.findFirst({ where: { tokenHash } });
    if (!agent) throw new ApiError("NOT_REGISTERED", "Agent must register first", 409);

    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        status: body.status,
        activeJobId: body.activeJobId,
        photoshopAvailable: body.photoshopAvailable,
        photoshopVersion: body.photoshopVersion,
        lastSeenAt: new Date(),
      },
    });

    await sweepStaleJobs(prisma);
    await sweepOfflineAgents(prisma);

    return jsonOk({ ok: true, serverTime: new Date().toISOString() });
  } catch (err) {
    return toErrorResponse(err);
  }
}
