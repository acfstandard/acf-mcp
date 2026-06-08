import { describe, expect, it } from "vitest";
import { ACF_PROMPTS, renderPrompt } from "../../src/core/prompts";

describe("ACF prompts", () => {
  it("exposes 6 prompts", () => {
    expect(ACF_PROMPTS.length).toBe(6);
    const names = ACF_PROMPTS.map((p) => p.name);
    expect(names).toContain("acf.brief-dpia");
    expect(names).toContain("acf.brief-art49-register");
    expect(names).toContain("acf.brief-board-report");
    expect(names).toContain("acf.brief-ddao-mandate");
    expect(names).toContain("acf.brief-classify-system");
    expect(names).toContain("acf.brief-teacher-case");
  });

  it("renderPrompt acf.brief-dpia embeds canonical URIs", () => {
    const out = renderPrompt("acf.brief-dpia", {
      system_name: "Sample agent",
      system_description: "Internal copilot",
      deployment_context: "France, 50-people team",
      high_risk_qualified: false,
    });
    expect(out.messages[0].content.text).toMatch(/acf:\/\/guide\/gdpr/);
    expect(out.messages[0].content.text).toMatch(/acf:\/\/fiche\/ACF-11/);
  });

  it("renderPrompt acf.brief-board-report includes the quarter arg", () => {
    const out = renderPrompt("acf.brief-board-report", {
      quarter: "Q3 2026", ai_systems_count: 12,
    });
    expect(out.messages[0].content.text).toMatch(/Q3 2026/);
    expect(out.messages[0].content.text).toMatch(/12/);
  });

  it("renderPrompt throws on unknown prompt", () => {
    expect(() => renderPrompt("acf.unknown", {})).toThrow();
  });
});
