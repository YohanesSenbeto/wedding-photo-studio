import { describe, it, expect } from "vitest";
import { tokensMatch, hashAgentToken, extractBearerToken } from "@/lib/agent-auth";

describe("agent authentication", () => {
  it("hashes tokens deterministically", () => {
    expect(hashAgentToken("abc")).toBe(hashAgentToken("abc"));
    expect(hashAgentToken("abc")).not.toBe(hashAgentToken("abd"));
    expect(hashAgentToken("abc")).toHaveLength(64);
  });

  it("accepts the correct token (timing-safe compare)", () => {
    expect(tokensMatch("correct-token-value", "correct-token-value")).toBe(true);
  });

  it("rejects wrong tokens", () => {
    expect(tokensMatch("wrong", "correct-token-value")).toBe(false);
    expect(tokensMatch("", "correct-token-value")).toBe(false);
  });

  it("extracts bearer tokens", () => {
    const request = {
      headers: { get: (k: string) => (k === "authorization" ? "Bearer tok-123" : null) },
    } as unknown as Request;
    expect(extractBearerToken(request)).toBe("tok-123");

    const none = {
      headers: { get: () => null },
    } as unknown as Request;
    expect(extractBearerToken(none)).toBeNull();
  });
});
