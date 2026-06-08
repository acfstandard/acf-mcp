import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleIdentifyGapsTool } from "../../src/core/tool-identify-gaps";
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

describe("handleIdentifyGapsTool", () => {
  it("returns gaps for an under-equipped 12-agent org with high-risk inventory", async () => {
    const registry = await makeRegistry();
    const out = await handleIdentifyGapsTool(registry, {
      current_inventory: { ai_systems_count: 12, high_risk_count: 3, gpai_used: true, shadow_ai_known: true },
      current_processes: [
        { process: "ai_committee", exists: false },
        { process: "decision_register", exists: false },
        { process: "kill_switch_drill", exists: false },
        { process: "dpia", exists: false },
        { process: "ai_inventory", exists: true, documented: false },
      ],
    });
    expect(out.gaps.length).toBeGreaterThan(0);
    expect(out.maturity_score.overall).toBeLessThan(50);
    expect(out.priority_order.length).toBeGreaterThan(0);
    expect(out.disclaimer).toBe(ACF_REASON_DISCLAIMER);
  });

  it("returns higher maturity score when most processes exist", async () => {
    const registry = await makeRegistry();
    const out = await handleIdentifyGapsTool(registry, {
      current_inventory: { ai_systems_count: 2 },
      current_processes: [
        { process: "ai_committee", exists: true, documented: true },
        { process: "decision_register", exists: true, documented: true },
        { process: "kill_switch_drill", exists: true, documented: true },
        { process: "dpia", exists: true, documented: true },
      ],
    });
    expect(out.maturity_score.overall).toBeGreaterThan(50);
  });
});
