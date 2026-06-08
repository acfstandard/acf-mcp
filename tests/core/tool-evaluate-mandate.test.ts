import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleEvaluateMandateTool } from "../../src/core/tool-evaluate-mandate";
import { ContentLoader } from "../../src/core/content";
import { RulesLoader } from "../../src/core/rules-loader";
import { SearchEngine } from "../../src/core/search";

const ROOT = path.resolve(__dirname, "../..");

async function makeRegistry() {
  const content = new ContentLoader({ contentRoot: path.join(ROOT, "content") });
  const rules = new RulesLoader({ rulesRoot: path.join(ROOT, "content", "rules") });
  const search = await SearchEngine.fromFile(
    path.join(ROOT, "dist", "search-index.json"),
  );
  return { content, rules, search, meta: await content.loadMeta() };
}

const sampleMandate = `# Agent Mandate — Stock Reordering Agent
DDAO: Supply Chain Director
Decision perimeter: place reorders within EUR 5k contracts.
Allowed actions: place_order_within_window, alert_stockout.
Forbidden actions: modify supplier panel, negotiate terms.
Escalation thresholds: any order > EUR 5k → DDAO ack.
Kill switch: suspension by DDAO or COMEX, drill quarterly.
Audit log: structured decision register, retained 5 years.
Doctrine version: ACF® v1.0.`;

describe("handleEvaluateMandateTool", () => {
  it("approves a complete mandate", async () => {
    const registry = await makeRegistry();
    const out = await handleEvaluateMandateTool(registry, {
      mandate_text: sampleMandate,
      agent_purpose: "Stock reordering for 7 stores.",
    });
    expect(["approve", "approve_with_changes"]).toContain(out.verdict);
    expect(out.acf_compliance_score).toBeGreaterThan(50);
  });

  it("rejects an empty-shell mandate", async () => {
    const registry = await makeRegistry();
    const out = await handleEvaluateMandateTool(registry, {
      mandate_text: "Agent: do whatever needed. DDAO: TBD. Sign off: TBD. Escalation: TBD. Kill switch: TBD.",
      agent_purpose: "Generic agent.",
    });
    expect(out.identified_gaps.length).toBeGreaterThan(0);
    expect(out.acf_compliance_score).toBeLessThan(50);
  });
});
