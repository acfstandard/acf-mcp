import path from "node:path";
import { describe, expect, it } from "vitest";
import { handleFicheLookupTool } from "../../src/core/tools-read";
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

describe("handleFicheLookupTool", () => {
  it("returns ACF-03 in FR", async () => {
    const registry = await makeRegistry();
    const out = await handleFicheLookupTool(registry, {
      code: "ACF-03",
      locale: "fr",
    });
    expect(out.code).toBe("ACF-03");
    expect(out.markdown).toContain("Constitution");
    expect(out.uri).toBe("acf://fiche/ACF-03");
  });

  it("rejects malformed code", async () => {
    const registry = await makeRegistry();
    await expect(
      handleFicheLookupTool(registry, { code: "ACF-99" }),
    ).rejects.toThrow();
  });

  it("returns frontmatter when include_frontmatter=true", async () => {
    const registry = await makeRegistry();
    const out = await handleFicheLookupTool(registry, {
      code: "ACF-00",
      include_frontmatter: true,
    });
    expect(out.metadata).toBeDefined();
    expect(out.metadata["keywords"]).toBeInstanceOf(Array);
  });
});
