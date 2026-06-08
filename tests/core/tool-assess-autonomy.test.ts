import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleAssessAutonomyTool } from "../../src/core/tool-assess-autonomy";
import { ContentLoader } from "../../src/core/content";
import { RulesLoader } from "../../src/core/rules-loader";
import { SearchEngine } from "../../src/core/search";
import { ACF_REASON_DISCLAIMER } from "../../src/constants/disclaimer";

const ROOT = path.resolve(__dirname, "../..");

async function makeRegistry() {
  const content = new ContentLoader({ contentRoot: path.join(ROOT, "content") });
  const rules = new RulesLoader({ rulesRoot: path.join(ROOT, "content", "rules") });
  const search = await SearchEngine.fromFile(
    path.join(ROOT, "dist", "search-index.json"),
  );
  return { content, rules, search, meta: await content.loadMeta() };
}

describe("handleAssessAutonomyTool", () => {
  it("returns N3 recommendation for irreversible regulatory actions", async () => {
    const registry = await makeRegistry();
    const out = await handleAssessAutonomyTool(registry, {
      agent_description: "Agent that auto-executes loan approvals up to EUR 50k.",
      intended_actions: ["approve_loan", "release_funds"],
      reversibility: "irreversible",
      audit_requirements: "regulatory",
    });
    expect(["N2", "N3"]).toContain(out.recommended_level.level);
    expect(out.kill_switch_design.levels.length).toBeGreaterThan(0);
    expect(out.disclaimer).toBe(ACF_REASON_DISCLAIMER);
    expect(out.requires_human_review).toBe(true);
  });

  it("returns N0 recommendation for read-only assistance", async () => {
    const registry = await makeRegistry();
    const out = await handleAssessAutonomyTool(registry, {
      agent_description: "Search assistant returning policy excerpts.",
      intended_actions: ["search", "summarise"],
      reversibility: "fully",
      audit_requirements: "internal",
    });
    expect(["N0", "N1"]).toContain(out.recommended_level.level);
  });

  it("returns gating thresholds with go/no-go criteria", async () => {
    const registry = await makeRegistry();
    const out = await handleAssessAutonomyTool(registry, {
      agent_description: "Refund agent.",
      intended_actions: ["issue_refund"],
      reversibility: "partially",
      audit_requirements: "internal",
    });
    expect(out.go_no_go_criteria.length).toBeGreaterThan(0);
    expect(out.gating_thresholds.length).toBeGreaterThan(0);
  });
});
