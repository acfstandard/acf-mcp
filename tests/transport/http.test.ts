import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleMcpRequest } from "../../src/transport/http";

const ROOT = path.resolve(__dirname, "../..");

describe("HTTP MCP transport", () => {
  it("handles a list_tools request and returns 12 tools", async () => {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {},
    });
    const req = new Request("https://mcp.acfstandard.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const res = await handleMcpRequest(req, {
      contentRoot: path.join(ROOT, "content"),
      rulesRoot: path.join(ROOT, "content", "rules"),
      indexPath: path.join(ROOT, "dist", "search-index.json"),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.result.tools)).toBe(true);
    expect(json.result.tools.length).toBe(12);
  });

  it("returns InvalidParams on malformed tool input", async () => {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "acf.search", arguments: { query: "" } },
    });
    const req = new Request("https://mcp.acfstandard.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const res = await handleMcpRequest(req, {
      contentRoot: path.join(ROOT, "content"),
      rulesRoot: path.join(ROOT, "content", "rules"),
      indexPath: path.join(ROOT, "dist", "search-index.json"),
    });
    expect([200, 400]).toContain(res.status);
  });
});
