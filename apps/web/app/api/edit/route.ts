import { NextRequest } from "next/server";
import {
  CreateEditJobSchema,
  PresetParamsSchema,
  ValidationError,
} from "@wedding/validation";
import { PRESETS, getPreset } from "@wedding/config";
import { prisma } from "@/lib/db";
import { createEditJobs } from "@/lib/jobs";
import { toJobDTO } from "@/lib/dto";
import { jsonOk, toErrorResponse, ApiError, readJsonBody } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/edit — queue professional edits for the selected photos.
 * Body: CreateEditJobSchema (photoIds + preset or customParams + output opts)
 * The actual editing is done by the LOCAL PHOTOSHOP AGENT — this route only
 * validates input and creates the job records.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const parsed = CreateEditJobSchema.safeParse(body);
    if (!parsed.success) {
      return jsonValidationError(new ValidationError(parsed.error.issues));
    }

    const validated = parsed.data;

    // Resolve the effective preset parameters.
    let baseParams: Record<string, unknown> | null = null;
    let presetId: string | null = null;
    let presetKey: string;

    if (validated.presetId) {
      const row = await prisma.editingPreset.findUnique({ where: { id: validated.presetId } });
      if (!row) throw new ApiError("PRESET_NOT_FOUND", "Preset not found", 404);
      baseParams = row.params as Record<string, unknown>;
      presetId = row.id;
      presetKey = row.key;
    } else if (validated.presetKey) {
      const builtIn = getPreset(validated.presetKey);
      if (!builtIn) {
        const dbPreset = await prisma.editingPreset.findUnique({
          where: { key: validated.presetKey },
        });
        if (!dbPreset) throw new ApiError("PRESET_NOT_FOUND", `Unknown preset "${validated.presetKey}"`, 400);
        baseParams = dbPreset.params as Record<string, unknown>;
        presetId = dbPreset.id;
        presetKey = dbPreset.key;
      } else {
        baseParams = builtIn.params as unknown as Record<string, unknown>;
        presetKey = builtIn.key;
      }
    } else {
      // customParams only — start from the natural baseline.
      baseParams = PRESETS[0].params as unknown as Record<string, unknown>;
      presetKey = "CUSTOM";
    }

    const merged = { ...baseParams, ...(validated.customParams ?? {}) };
    const presetParams = PresetParamsSchema.safeParse(merged);
    if (!presetParams.success) {
      throw new ValidationError(presetParams.error.issues);
    }

    const jobs = await createEditJobs(prisma, {
      photoIds: validated.photoIds,
      presetParams: presetParams.data as unknown as Record<string, unknown>,
      presetKey,
      presetId,
      outputFormats: validated.outputFormats,
      quality: validated.quality,
      colorMode: validated.colorMode,
      dpi: validated.dpi,
    });

    return jsonOk({ jobs: jobs.map(toJobDTO) }, 201);
  } catch (err) {
    if (err instanceof ValidationError) {
      return jsonValidationError(err);
    }
    return toErrorResponse(err);
  }
}

function jsonValidationError(err: ValidationError) {
  const { NextResponse } = require("next/server") as typeof import("next/server");
  return NextResponse.json(
    { error: err.message, code: "VALIDATION_ERROR", details: err.issues },
    { status: 400 }
  );
}
