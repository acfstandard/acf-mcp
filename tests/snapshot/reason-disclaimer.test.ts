import path from "node:path";
import { describe, expect, it } from "vitest";
import { ContentLoader } from "../../src/core/content";
import { RulesLoader } from "../../src/core/rules-loader";
import { SearchEngine } from "../../src/core/search";
import { handleAdvisorTool } from "../../src/core/tool-advisor";
import { handleClassifyAgentTool } from "../../src/core/tool-classify-agent";
import { handleAssessAutonomyTool } from "../../src/core/tool-assess-autonomy";
import { handleIdentifyGapsTool } from "../../src/core/tool-identify-gaps";
import { handleMapObligationsTool } from "../../src/core/tool-map-obligations";
import { handleAssignControlsTool } from "../../src/core/tool-assign-controls";
import { handleEvaluateMandateTool } from "../../src/core/tool-evaluate-mandate";
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

const CANONICAL_INPUTS = {
  advisor: {
    case_description: "Internal copilot drafting customer emails for a 50-people team. No automated send.",
  },
  classifyAgent: {
    name: "Sample stock agent",
    description: "Internal stock reordering within bounded price window. No PII.",
    decisions_taken: ["place_order_within_window"],
    human_approval_required: "sometimes",
    personal_data_level: "none",
    financial_exposure: "medium_contract",
    external_actions: "limited_write",
    gpai_used: false,
    usage_audience: "internal",
  },
  assessAutonomy: {
    agent_description: "Refund agent up to EUR 200.",
    intended_actions: ["issue_refund"],
    reversibility: "partially",
    audit_requirements: "internal",
  },
  identifyGaps: {
    current_inventory: { ai_systems_count: 5 },
    current_processes: [{ process: "ai_committee", exists: true }],
  },
  mapObligations: {
    annex: "iii",
    use_case: "credit scoring agent for retail loans",
    provider_or_deployer: "provider",
  },
  assignControls: {
    agent_description: "Refund agent up to EUR 200.",
    acf_level: "N2",
    risk_level: "high",
  },
  evaluateMandate: {
    mandate_text: "Agent X. DDAO: Bob. Decision perimeter: refunds up to EUR 200. Allowed: issue_refund. Forbidden: above EUR 200. Escalation: above EUR 200 → Bob. Kill switch: suspend by Bob. Audit log: 5 years.",
    agent_purpose: "Refund agent.",
  },
};

const CASES = [
  { name: "acf.advisor", run: async (r: any) => handleAdvisorTool(r, CANONICAL_INPUTS.advisor) },
  { name: "acf.classify-agent", run: async (r: any) => handleClassifyAgentTool(r, CANONICAL_INPUTS.classifyAgent) },
  { name: "acf.assess-autonomy", run: async (r: any) => handleAssessAutonomyTool(r, CANONICAL_INPUTS.assessAutonomy) },
  { name: "acf.identify-governance-gaps", run: async (r: any) => handleIdentifyGapsTool(r, CANONICAL_INPUTS.identifyGaps) },
  { name: "acf.map-ai-act-obligations", run: async (r: any) => handleMapObligationsTool(r, CANONICAL_INPUTS.mapObligations) },
  { name: "acf.assign-ddao-controls", run: async (r: any) => handleAssignControlsTool(r, CANONICAL_INPUTS.assignControls) },
  { name: "acf.evaluate-agent-mandate", run: async (r: any) => handleEvaluateMandateTool(r, CANONICAL_INPUTS.evaluateMandate) },
];

describe("REASON tools — canonical 4-field snapshot", () => {
  for (const c of CASES) {
    describe(c.name, () => {
      it("disclaimer exactly matches the canonical constant", async () => {
        const registry = await makeRegistry();
        const out = (await c.run(registry)) as Record<string, unknown>;
        expect(out["disclaimer"]).toBe(ACF_REASON_DISCLAIMER);
      });
      it("requires_human_review === true", async () => {
        const registry = await makeRegistry();
        const out = (await c.run(registry)) as Record<string, unknown>;
        expect(out["requires_human_review"]).toBe(true);
      });
      it("doctrine_hash is non-empty and starts with sha256:", async () => {
        const registry = await makeRegistry();
        const out = (await c.run(registry)) as Record<string, unknown>;
        const h = out["doctrine_hash"];
        expect(typeof h).toBe("string");
        expect(String(h).length).toBeGreaterThan(8);
        expect(String(h).startsWith("sha256:")).toBe(true);
      });
      it("doctrine_version matches ACF framework vX / rules YYYY-MM", async () => {
        const registry = await makeRegistry();
        const out = (await c.run(registry)) as Record<string, unknown>;
        expect(String(out["doctrine_version"])).toMatch(
          /^ACF framework v\S+ \/ rules \d{4}-\d{2}$/,
        );
      });
    });
  }
});
