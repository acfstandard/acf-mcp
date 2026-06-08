import { describe, expect, it } from "vitest";
import {
  checkRateLimit, pickRateLimitConfig, RATE_LIMIT_TIERS,
} from "../../src/lib/rate-limit";

describe("rate-limit tiers", () => {
  it("4 canonical tiers are defined", () => {
    expect(Object.keys(RATE_LIMIT_TIERS).sort()).toEqual([
      "mcp.fiche", "mcp.heavy-read", "mcp.reason", "mcp.search",
    ]);
  });

  it("pickRateLimitConfig recognises a reason tool", () => {
    const cfg = pickRateLimitConfig({
      method: "tools/call",
      toolName: "acf.classify-agent",
    });
    expect(cfg.key).toBe("mcp.reason");
    expect(cfg.perIpLimit).toBe(30);
  });

  it("pickRateLimitConfig recognises whitepaper as heavy-read", () => {
    const cfg = pickRateLimitConfig({
      method: "resources/read",
      uri: "acf://whitepaper",
    });
    expect(cfg.key).toBe("mcp.heavy-read");
    expect(cfg.perIpLimit).toBe(15);
  });
});

describe("checkRateLimit", () => {
  const HARNESS = "test-key-" + Math.random();

  it("allows within limit", () => {
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit(`${HARNESS}-ip-1`, {
        key: "mcp.search",
        perIpLimit: 60,
        globalLimit: 1000,
        windowMs: 60_000,
      });
      expect(r.allowed).toBe(true);
    }
  });

  it("blocks above per-IP limit", () => {
    const ip = `${HARNESS}-ip-2`;
    let lastAllowed = true;
    for (let i = 0; i < 32; i++) {
      const r = checkRateLimit(ip, {
        key: "mcp.reason",
        perIpLimit: 30,
        globalLimit: 1000,
        windowMs: 60_000,
      });
      lastAllowed = r.allowed;
    }
    expect(lastAllowed).toBe(false);
  });
});
