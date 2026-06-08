import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleMapObligationsTool } from "../../src/core/tool-map-obligations";
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

describe("handleMapObligationsTool", () => {
  it("returns Annex III obligations for credit scoring", async () => {
    const registry = await makeRegistry();
    const out = await handleMapObligationsTool(registry, {
      annex: "iii",
      use_case: "credit scoring agent for retail loans up to EUR 50k",
      provider_or_deployer: "provider",
    });
    expect(out.obligations.pre_go_live.length).toBeGreaterThan(0);
    expect(out.total_count).toBeGreaterThan(0);
    expect(out.critical_path.length).toBeGreaterThan(0);
  });

  it("returns deferred flag on Annex III obligations", async () => {
    const registry = await makeRegistry();
    const out = await handleMapObligationsTool(registry, {
      annex: "iii",
      use_case: "facial recognition for access control",
      provider_or_deployer: "deployer",
    });
    const all = [
      ...out.obligations.pre_go_live, ...out.obligations.continuous, ...out.obligations.on_incident,
    ];
    expect(all.some((o) => o.digital_omnibus_deferred === true)).toBe(true);
  });
});
