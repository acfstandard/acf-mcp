import path from "node:path";
import { describe, expect, it } from "vitest";
import { RulesLoader } from "../../src/core/rules-loader";
import { inferAiActObligations } from "../../src/core/infer-obligations";

const RULES_ROOT = path.resolve(__dirname, "../../content/rules");
const rules = new RulesLoader({ rulesRoot: RULES_ROOT });

describe("inferAiActObligations", () => {
  it("fires credit scoring on a credit agent", async () => {
    const annexIII = await rules.loadAiActAnnexIII();
    const annexI = await rules.loadAiActAnnexI();
    const gpai = await rules.loadGpaiTriggers();
    const out = inferAiActObligations({ annexIII, annexI, gpai }, {
      text: "we run a credit scoring agent for loan decisions",
      enums: { ai_act_triggers: ["credit_scoring"] },
      flags: ["financial_exposure:high_corporate"],
    });
    expect(out.firedCategories.some((c) => c.id.includes("credit-scoring"))).toBe(true);
  });

  it("does NOT fire annex-iii items when description negates them", async () => {
    const annexIII = await rules.loadAiActAnnexIII();
    const annexI = await rules.loadAiActAnnexI();
    const gpai = await rules.loadGpaiTriggers();
    const out = inferAiActObligations({ annexIII, annexI, gpai }, {
      text: "the agent never analyses faces and never accesses biometric data",
      enums: {},
      flags: [],
    });
    expect(out.firedCategories.find((c) => c.id.includes("biometric"))).toBeUndefined();
  });

  it("fires GPAI obligations when gpai_used=true", async () => {
    const annexIII = await rules.loadAiActAnnexIII();
    const annexI = await rules.loadAiActAnnexI();
    const gpai = await rules.loadGpaiTriggers();
    const out = inferAiActObligations({ annexIII, annexI, gpai }, {
      text: "we use an LLM for customer support",
      enums: { gpai_used: ["true"] },
      flags: [],
    });
    expect(out.gpaiObligations.length).toBeGreaterThan(0);
  });
});
