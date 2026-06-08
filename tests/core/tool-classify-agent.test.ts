import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleClassifyAgentTool } from "../../src/core/tool-classify-agent";
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
  const meta = await content.loadMeta();
  return { content, rules, search, meta };
}

const sampleInput = {
  name: "Lendari stock agent",
  description:
    "Internal stock reordering agent operating within a price window. No PII processed. Reorders within EUR 5k contracts.",
  decisions_taken: ["place_order_within_window", "alert_stockout"],
  human_approval_required: "sometimes",
  personal_data_level: "none",
  financial_exposure: "medium_contract",
  external_actions: "limited_write",
  gpai_used: false,
  usage_audience: "internal",
};

describe("handleClassifyAgentTool", () => {
  it("returns full output with N2 + medium-criticality for the baseline", async () => {
    const registry = await makeRegistry();
    const out = await handleClassifyAgentTool(registry, sampleInput);
    expect(out.acf_level.level).toBe("N2");
    expect(["medium", "high"]).toContain(out.criticality.score);
    expect(out.applicable_fiches.length).toBeGreaterThan(0);
  });

  it("snapshots the 4 canonical fields", async () => {
    const registry = await makeRegistry();
    const out = await handleClassifyAgentTool(registry, sampleInput);
    expect(out.disclaimer).toBe(ACF_REASON_DISCLAIMER);
    expect(out.requires_human_review).toBe(true);
    expect(out.doctrine_hash).toMatch(/^sha256:/);
    expect(out.doctrine_version).toMatch(/^ACF framework v.+\/ rules .+$/);
  });

  it("conversion_cta points to /compliance with ref=mcp", async () => {
    const registry = await makeRegistry();
    const out = await handleClassifyAgentTool(registry, sampleInput);
    expect(out.conversion_cta).toMatch(/acfstandard\.com\/compliance/);
    expect(out.conversion_cta).toMatch(/ref=mcp/);
  });

  it("fires credit-scoring when the description triggers it", async () => {
    const registry = await makeRegistry();
    const out = await handleClassifyAgentTool(registry, {
      ...sampleInput,
      description:
        "Customer credit scoring agent: it takes loan decisions for retail clients up to EUR 50k.",
      personal_data_level: "standard",
      financial_exposure: "high_corporate",
      usage_audience: "public_consumer",
      ai_act_triggers: ["credit_scoring"],
      processing_purposes: ["core_financial"],
    });
    const firedIds = out.rationale_per_rule
      .filter((r) => r.fired)
      .map((r) => r.rule_id);
    expect(firedIds.some((id) => id.includes("credit-scoring"))).toBe(true);
    expect(out.regulatory_qualifications.likely_ai_act_role).not.toBe("not_applicable");
  });

  it("respects negation: never analyses faces → no biometric trigger", async () => {
    const registry = await makeRegistry();
    const out = await handleClassifyAgentTool(registry, {
      ...sampleInput,
      description:
        "The agent never analyses faces and never accesses biometric data. It is a simple text classifier for internal triage.",
    });
    const biometricFired = out.rationale_per_rule.find(
      (r) => r.fired && r.rule_id.includes("biometric"),
    );
    expect(biometricFired).toBeUndefined();
  });
});
