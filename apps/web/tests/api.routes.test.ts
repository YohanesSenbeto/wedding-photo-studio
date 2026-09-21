import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    photo: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    editingPreset: { findUnique: vi.fn(), findMany: vi.fn() },
    editingJob: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    agent: { findMany: vi.fn(), updateMany: vi.fn(), findFirst: vi.fn() },
    album: { findMany: vi.fn(), findUnique: vi.fn() },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

import { GET as listPhotos } from "@/app/api/photos/route";
import { GET as agentStatus } from "@/app/api/agent/status/route";
import { prisma } from "@/lib/db";

const db = prisma as unknown as {
  photo: { findMany: ReturnType<typeof vi.fn> };
  agent: { findMany: ReturnType<typeof vi.fn>; updateMany: ReturnType<typeof vi.fn> };
};

function photoRow(id: string, ext: string) {
  const now = new Date();
  return {
    id,
    originalName: `IMG_${id}.${ext}`,
    fileName: `uuid.${ext === "arw" ? "arw" : "jpg"}`,
    filePath: `/storage/uploads/2026/01/uuid.${ext === "arw" ? "arw" : "jpg"}`,
    mimeType: ext === "arw" ? "image/x-sony-arw" : "image/jpeg",
    extension: ext,
    width: 4000,
    height: 2500,
    fileSize: 12_345,
    status: "ANALYZED",
    userId: null,
    createdAt: now,
    updatedAt: now,
  };
}

describe("GET /api/photos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns photo DTOs with a RAW flag", async () => {
    db.photo.findMany.mockResolvedValue([photoRow("p1", "arw"), photoRow("p2", "jpg")]);
    const res = await listPhotos(new Request("http://localhost/api/photos") as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.photos).toHaveLength(2);
    expect(body.photos[0].isRaw).toBe(true);
    expect(body.photos[1].isRaw).toBe(false);
  });
});

describe("GET /api/agent/status", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists agents without leaking the token hash", async () => {
    db.agent.updateMany.mockResolvedValue({ count: 0 });
    db.agent.findMany.mockResolvedValue([
      {
        id: "a1",
        name: "Wedding Photoshop Agent",
        machineName: "STUDIO-PC",
        platform: "win32 x64",
        appVersion: "1.0.0",
        photoshopVersion: "2022",
        photoshopAvailable: true,
        photoshopMode: "COM",
        status: "ONLINE",
        activeJobId: null,
        tokenHash: "SECRET-HASH",
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await agentStatus(new Request("http://localhost/api/agent/status") as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.agents[0].machineName).toBe("STUDIO-PC");
    expect(JSON.stringify(body)).not.toContain("SECRET-HASH");
  });
});
