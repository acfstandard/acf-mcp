import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleAdvisorTool } from "../../src/core/tool-advisor";
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

describe("handleAdvisorTool", () => {
  it("returns full structured advice on a free-text case", async () => {
    const registry = await makeRegistry();
    const out = await handleAdvisorTool(registry, {
      case_description:
        "We deploy an internal copilot that drafts customer emails for a 50-people team. No automated send. The team validates each draft. No PII outside customer name and email.",
      jurisdiction: "eu",
    });
    expect(out.autonomy_level).toBeDefined();
    expect(out.activated_principles.length).toBeGreaterThan(0);
    expect(out.first_actions.length).toBeGreaterThanOrEqual(3);
    expect(out.disclaimer).toBe(ACF_REASON_DISCLAIMER);
    expect(out.requires_human_review).toBe(true);
    expect(out.doctrine_hash).toMatch(/^sha256:/);
  });

  it("rejects too-short case_description", async () => {
    const registry = await makeRegistry();
    await expect(
      handleAdvisorTool(registry, { case_description: "short" }),
    ).rejects.toThrow();
  });

  it("includes conversion_cta to /compliance", async () => {
    const registry = await makeRegistry();
    const out = await handleAdvisorTool(registry, {
      case_description:
        "We deploy a credit scoring agent for retail loans up to EUR 50k. Internal use only.",
    });
    expect(out.conversion_cta).toMatch(/acfstandard\.com\/compliance/);
  });
});
