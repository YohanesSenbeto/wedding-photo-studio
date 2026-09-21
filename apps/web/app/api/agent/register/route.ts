import { NextRequest } from "next/server";
import { AgentRegisterSchema } from "@wedding/validation";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agent-auth";
import { jsonOk, toErrorResponse, ApiError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/agent/register — the local Photoshop agent announces itself.
 * Requires the shared AGENT_TOKEN (Bearer). Idempotent per machine.
 */
export async function POST(request: NextRequest) {
  try {
    const tokenHash = authenticateAgent(request);
    if (!tokenHash) throw new ApiError("UNAUTHORIZED", "Invalid or missing agent token", 401);

    const body = AgentRegisterSchema.parse(await request.json());

    const existing = await prisma.agent.findFirst({
      where: { machineName: body.machineName },
    });

    const data = {
      name: body.name,
      machineName: body.machineName,
      platform: body.platform,
      appVersion: body.appVersion,
      photoshopVersion: body.photoshopVersion,
      photoshopAvailable: body.photoshopAvailable,
      photoshopMode: body.photoshopMode,
      status: "ONLINE" as const,
      tokenHash,
      lastSeenAt: new Date(),
    };

    const saved = existing
      ? await prisma.agent.update({ where: { id: existing.id }, data })
      : await prisma.agent.create({ data });

    return jsonOk({ agentId: saved.id, registered: true }, existing ? 200 : 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
