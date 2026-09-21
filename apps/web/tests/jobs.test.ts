import { describe, it, expect } from "vitest";
import { isValidTransition, ACTIVE_STATUSES } from "@/lib/jobs";
import type { JobStatus } from "@wedding/types";

describe("job status state machine", () => {
  it("allows forward transitions only", () => {
    expect(isValidTransition("QUEUED", "CONNECTING")).toBe(true);
    expect(isValidTransition("CONNECTING", "PHOTOSHOP_OPENING")).toBe(true);
    expect(isValidTransition("PHOTOSHOP_OPENING", "EDITING")).toBe(true);
    expect(isValidTransition("EDITING", "EXPORTING")).toBe(true);
    expect(isValidTransition("EXPORTING", "COMPLETED")).toBe(true);
  });

  it("rejects backward transitions", () => {
    expect(isValidTransition("EDITING", "QUEUED")).toBe(false);
    expect(isValidTransition("COMPLETED", "EDITING")).toBe(false);
    expect(isValidTransition("COMPLETED", "FAILED")).toBe(false);
    expect(isValidTransition("FAILED", "EDITING")).toBe(false);
  });

  it("rejects identical status (idempotent progress is handled elsewhere)", () => {
    expect(isValidTransition("EDITING", "EDITING")).toBe(false);
  });

  it("allows any active status to jump forward (e.g. straight to FAILED)", () => {
    for (const status of ACTIVE_STATUSES) {
      expect(isValidTransition(status as JobStatus, "FAILED")).toBe(true);
      expect(isValidTransition(status as JobStatus, "COMPLETED")).toBe(true);
    }
  });

  it("covers all documented statuses", () => {
    // §6: QUEUED, CONNECTING, PROCESSING, PHOTOSHOP_OPENING, EDITING,
    //     EXPORTING, COMPLETED, FAILED
    const all: JobStatus[] = [
      "QUEUED", "CONNECTING", "PROCESSING", "PHOTOSHOP_OPENING",
      "EDITING", "EXPORTING", "COMPLETED", "FAILED",
    ];
    for (const status of all) {
      expect(ACTIVE_STATUSES.includes(status) || status === "COMPLETED" || status === "FAILED").toBe(true);
    }
  });
});
