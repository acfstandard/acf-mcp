import { describe, expect, it } from "vitest";
import { sanitizeForLog, hashIp, ALLOWED_LOG_FIELDS } from "../../src/core/logger";

describe("sanitizeForLog", () => {
  it("keeps whitelisted fields", () => {
    const out = sanitizeForLog({
      type: "mcp.request",
      method: "tools/call",
      tool: "acf.classify-agent",
      duration_ms: 12,
      status: "ok",
      request_id: "uuid-1",
      ip_hash: "abc",
    });
    expect(out).toEqual({
      type: "mcp.request",
      method: "tools/call",
      tool: "acf.classify-agent",
      duration_ms: 12,
      status: "ok",
      request_id: "uuid-1",
      ip_hash: "abc",
    });
  });

  it("strips description / case_description / mandate_text", () => {
    const out = sanitizeForLog({
      type: "mcp.request",
      method: "tools/call",
      tool: "acf.advisor",
      case_description: "PII LEAK !!!",
      description: "PII LEAK !!!",
      mandate_text: "PII LEAK !!!",
      agent_description: "PII LEAK !!!",
      agent_purpose: "PII LEAK !!!",
      name: "PII LEAK !!!",
    });
    expect(out).not.toHaveProperty("case_description");
    expect(out).not.toHaveProperty("description");
    expect(out).not.toHaveProperty("mandate_text");
    expect(out).not.toHaveProperty("agent_description");
    expect(out).not.toHaveProperty("agent_purpose");
    expect(out).not.toHaveProperty("name");
  });

  it("hashIp returns a 64-hex digest", () => {
    const h = hashIp("1.2.3.4", "salt-1");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });

  it("hashIp differs with different salts", () => {
    const h1 = hashIp("1.2.3.4", "salt-1");
    const h2 = hashIp("1.2.3.4", "salt-2");
    expect(h1).not.toBe(h2);
  });

  it("ALLOWED_LOG_FIELDS excludes any PII surface", () => {
    expect(ALLOWED_LOG_FIELDS.has("description")).toBe(false);
    expect(ALLOWED_LOG_FIELDS.has("case_description")).toBe(false);
    expect(ALLOWED_LOG_FIELDS.has("mandate_text")).toBe(false);
    expect(ALLOWED_LOG_FIELDS.has("decisions_taken")).toBe(false);
  });
});
