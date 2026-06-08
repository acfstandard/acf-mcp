import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleAssignControlsTool } from "../../src/core/tool-assign-controls";
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

describe("handleAssignControlsTool", () => {
  it("returns rich N3+critical controls", async () => {
    const registry = await makeRegistry();
    const out = await handleAssignControlsTool(registry, {
      agent_description: "Autonomous customer-support refund agent up to EUR 200.",
      acf_level: "N3", risk_level: "critical",
    });
    expect(out.recommended_controls.length).toBeGreaterThanOrEqual(5);
    expect(out.ddao_controls.length).toBeGreaterThan(0);
    expect(out.ddao_summary).toBeTruthy();
    expect(out.disclaimer).toBe(ACF_REASON_DISCLAIMER);
  });
});
