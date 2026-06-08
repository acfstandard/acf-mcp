import path from "node:path";
import { describe, expect, it } from "vitest";
import { listResources, readResource } from "../../src/core/resources";
import { ContentLoader } from "../../src/core/content";
import { RulesLoader } from "../../src/core/rules-loader";
import { SearchEngine } from "../../src/core/search";

const ROOT = path.resolve(__dirname, "../..");

async function makeRegistry() {
  const content = new ContentLoader({
    contentRoot: path.join(ROOT, "content"),
  });
  const rules = new RulesLoader({
    rulesRoot: path.join(ROOT, "content", "rules"),
  });
  const search = await SearchEngine.fromFile(
    path.join(ROOT, "dist", "search-index.json"),
  );
  const meta = await content.loadMeta();
  return { content, rules, search, meta };
}

describe("resources", () => {
  it("listResources returns at least 20 entries with valid URIs", async () => {
    const registry = await makeRegistry();
    const entries = await listResources(registry);
    expect(entries.length).toBeGreaterThan(20);
    for (const e of entries) {
      expect(e.uri).toMatch(/^acf:\/\//);
      expect(e.name).toBeTruthy();
    }
  });

  it("readResource resolves a principle", async () => {
    const registry = await makeRegistry();
    const r = await readResource(registry, "acf://framework/principle/P1?lang=fr");
    expect(r.contents[0]?.mimeType).toBe("application/json");
    const data = JSON.parse(r.contents[0]?.text ?? "{}");
    expect(data.code).toBe("P1");
  });

  it("readResource resolves a fiche in EN", async () => {
    const registry = await makeRegistry();
    const r = await readResource(registry, "acf://fiche/ACF-03?lang=en");
    expect(r.contents[0]?.mimeType).toBe("text/markdown");
  });

  it("readResource returns meta", async () => {
    const registry = await makeRegistry();
    const r = await readResource(registry, "acf://meta");
    const data = JSON.parse(r.contents[0]?.text ?? "{}");
    expect(data.framework_version).toBe("1.0");
  });

  it("readResource resolves a glossary entry by URI", async () => {
    const registry = await makeRegistry();
    const r = await readResource(registry, "acf://glossary/DDAO?lang=en");
    const data = JSON.parse(r.contents[0]?.text ?? "{}");
    expect(data.term).toBe("DDAO");
  });
});
