import { describe, it, expect, beforeAll } from "vitest";
import { authenticateToken } from "../src/auth";

beforeAll(() => {
  process.env.AGENT_TOKEN = process.env.AGENT_TOKEN || "test-agent-token-0123456789";
  process.env.SERVER_URL = process.env.SERVER_URL || "http://127.0.0.1:59999";
});

describe("agent token authentication", () => {
  it("accepts the configured token", () => {
    expect(authenticateToken("test-agent-token-0123456789")).toBe(true);
  });

  it("rejects wrong, empty and missing tokens", () => {
    expect(authenticateToken("wrong-token")).toBe(false);
    expect(authenticateToken("")).toBe(false);
    expect(authenticateToken(null)).toBe(false);
    expect(authenticateToken(undefined)).toBe(false);
  });

  it("rejects prefix-manipulated tokens (timing-safe hash compare)", () => {
    expect(authenticateToken("test-agent-token-0123456789 ")).toBe(false);
    expect(authenticateToken("test-agent-token-0123456789x")).toBe(false);
  });
});
