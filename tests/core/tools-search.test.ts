import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleSearchTool } from "../../src/core/tools-read";
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
  const meta = await content.loadMeta();
  return { content, rules, search, meta };
}

describe("handleSearchTool", () => {
  it("validates input and returns hits", async () => {
    const registry = await makeRegistry();
    const out = await handleSearchTool(registry, {
      query: "souveraineté",
      scope: "all",
      locale: "fr",
      limit: 5,
    });
    expect(out.hits.length).toBeGreaterThan(0);
    expect(out.hits[0]?.uri).toMatch(/^acf:/);
  });

  it("rejects too-short query", async () => {
    const registry = await makeRegistry();
    await expect(
      handleSearchTool(registry, { query: "a", scope: "all", locale: "fr", limit: 5 }),
    ).rejects.toThrow();
  });

  it("respects scope=fiche", async () => {
    const registry = await makeRegistry();
    const out = await handleSearchTool(registry, {
      query: "constitution",
      scope: "fiche",
      locale: "fr",
      limit: 10,
    });
    for (const h of out.hits) expect(h.category).toBe("fiche");
  });
});
