import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    photo: { findMany: vi.fn() },
    editingPreset: { findUnique: vi.fn() },
    editingJob: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { POST as createEdit } from "@/app/api/edit/route";
import { prisma } from "@/lib/db";

const db = prisma as unknown as {
  photo: { findMany: ReturnType<typeof vi.fn> };
  editingPreset: { findUnique: ReturnType<typeof vi.fn> };
  editingJob: { create: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

function photoRow(id: string) {
  const now = new Date();
  return {
    id,
    originalName: `IMG_${id}.jpg`,
    fileName: `uuid.jpg`,
    filePath: `/storage/uploads/2026/01/uuid.jpg`,
    mimeType: "image/jpeg",
    extension: "jpg",
    width: 4000,
    height: 2500,
    fileSize: 12_345,
    status: "ANALYZED",
    userId: null,
    createdAt: now,
    updatedAt: now,
  };
}

function jobRow(data: Record<string, unknown>) {
  return {
    id: `job-${Math.random().toString(36).slice(2)}`,
    agentJobId: "agent-1",
    type: "EDIT_PHOTO",
    status: "QUEUED",
    progress: 0,
    photoId: data.photoId,
    albumId: null,
    presetId: null,
    agentId: null,
    params: data.params,
    inputPath: "/storage/x.jpg",
    outputPath: null,
    errorMessage: null,
    errorCode: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: null,
  };
}

function editRequest(body: unknown) {
  return new Request("http://localhost/api/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

describe("POST /api/edit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("queues one job per photo with the preset parameters", async () => {
    db.editingPreset.findUnique.mockResolvedValue(null); // built-in preset path
    db.photo.findMany.mockResolvedValue([photoRow("p1"), photoRow("p2")]);
    db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({ editingJob: { create: db.editingJob.create } })
    );
    db.editingJob.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(jobRow(data))
    );

    const res = await createEdit(
      editRequest({
        photoIds: ["p1", "p2"],
        presetKey: "ELEGANT_WEDDING",
        outputFormats: ["JPG", "PSD"],
        quality: "HIGH",
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.jobs).toHaveLength(2);
    expect(db.editingJob.create).toHaveBeenCalledTimes(2);
    const created = db.editingJob.create.mock.calls[0][0].data;
    expect(created.type).toBe("EDIT_PHOTO");
    expect(created.params.presetKey).toBe("ELEGANT_WEDDING");
    expect(created.params.presetParams.contrast).toBe(12); // Elegant Wedding
  });

  it("supports per-run custom parameter overrides", async () => {
    db.editingPreset.findUnique.mockResolvedValue(null);
    db.photo.findMany.mockResolvedValue([photoRow("p1")]);
    db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({ editingJob: { create: db.editingJob.create } })
    );
    db.editingJob.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(jobRow(data))
    );

    const res = await createEdit(
      editRequest({
        photoIds: ["p1"],
        presetKey: "NATURAL_WEDDING",
        customParams: { exposure: 0.5, contrast: 20 },
      })
    );

    expect(res.status).toBe(201);
    const created = db.editingJob.create.mock.calls[0][0].data;
    expect(created.params.presetParams.exposure).toBe(0.5);
    expect(created.params.presetParams.vibrance).toBe(8); // base preset value kept
  });

  it("rejects unknown presets with 400", async () => {
    db.editingPreset.findUnique.mockResolvedValue(null);
    const res = await createEdit(editRequest({ photoIds: ["p1"], presetKey: "NOT_A_PRESET" }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid bodies with a validation error", async () => {
    const res = await createEdit(
      editRequest({ photoIds: "not-an-array", presetKey: "ELEGANT_WEDDING" })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects missing photos", async () => {
    db.editingPreset.findUnique.mockResolvedValue(null);
    db.photo.findMany.mockResolvedValue([]); // nothing found
    const res = await createEdit(editRequest({ photoIds: ["gone"], presetKey: "ELEGANT_WEDDING" }));
    expect(res.status).toBe(400);
  });
});
