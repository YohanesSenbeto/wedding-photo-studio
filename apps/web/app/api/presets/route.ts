import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonOk, toErrorResponse } from "@/lib/http";
import { PRESETS } from "@wedding/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/presets — built-in presets (DB-backed, falls back to static list). */
export async function GET(_request: NextRequest) {
  try {
    let rows = await prisma.editingPreset.findMany({ orderBy: { createdAt: "asc" } });
    if (rows.length === 0) {
      // Presets not seeded yet — serve the static definitions so the studio
      // works out of the box. `npm run db:seed` persists them.
      rows = PRESETS.map((p) => ({
        id: `builtin-${p.key}`,
        key: p.key,
        name: p.name,
        description: p.description,
        params: p.params,
        isBuiltIn: true,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        jobs: [],
      })) as never;
    }
    return jsonOk({
      presets: rows.map((r) => ({
        id: r.id,
        key: r.key,
        name: r.name,
        description: r.description,
        params: r.params,
        isBuiltIn: r.isBuiltIn,
      })),
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
