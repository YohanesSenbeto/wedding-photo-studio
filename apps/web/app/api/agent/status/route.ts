import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonOk, toErrorResponse } from "@/lib/http";
import { sweepOfflineAgents } from "@/lib/sweep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/agent/status — registered agents + Photoshop availability (UI-safe). */
export async function GET(_request: NextRequest) {
  try {
    await sweepOfflineAgents(prisma);
    const agents = await prisma.agent.findMany({
      orderBy: { lastSeenAt: "desc" },
      take: 20,
    });
    return jsonOk({
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        machineName: a.machineName,
        platform: a.platform,
        appVersion: a.appVersion,
        photoshopVersion: a.photoshopVersion,
        photoshopAvailable: a.photoshopAvailable,
        photoshopMode: a.photoshopMode,
        status: a.status,
        activeJobId: a.activeJobId,
        lastSeenAt: a.lastSeenAt.toISOString(),
      })),
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
