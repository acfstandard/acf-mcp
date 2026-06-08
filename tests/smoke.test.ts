import { describe, expect, it } from "vitest";
import { ACF_MCP_VERSION } from "../src/index";

describe("smoke", () => {
  it("exports version constant", () => {
    expect(ACF_MCP_VERSION).toBe("1.0.2");
  });
});
