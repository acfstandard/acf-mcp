import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  handleRegulationArticleTool,
  handleGlossaryDefineTool,
  handleCiteTool,
} from "../../src/core/tools-read";
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

describe("READ tools — regulation/glossary/cite", () => {
  it("acf.regulation.article returns text + mapping (V1 stub for AI Act Art. 9)", async () => {
    const registry = await makeRegistry();
    const out = await handleRegulationArticleTool(registry, {
      regulation: "ai-act", article: "9",
    });
    expect(out.regulation).toBe("ai-act");
    expect(out.article).toBe("9");
    expect(out.mapping).toBeDefined();
    expect(out.mapping.fiches.length).toBeGreaterThan(0);
  });

  it("acf.glossary.define returns DDAO definition", async () => {
    const registry = await makeRegistry();
    const out = await handleGlossaryDefineTool(registry, {
      term: "DDAO", locale: "en",
    });
    expect(out.term).toBe("DDAO");
    expect(out.expansion).toBe("Delegated Decision Agent Officer");
    expect(out.related.principles.length).toBeGreaterThan(0);
  });

  it("acf.cite returns APA citation for ACF-03", async () => {
    const registry = await makeRegistry();
    const out = await handleCiteTool(registry, {
      uri: "acf://fiche/ACF-03", style: "apa",
    });
    expect(out.citation).toMatch(/Dorange/);
    expect(out.citation).toMatch(/ACF/);
    expect(out.structured.author).toBeTruthy();
  });

  it("acf.cite supports BibTeX", async () => {
    const registry = await makeRegistry();
    const out = await handleCiteTool(registry, {
      uri: "acf://framework/principle/P1", style: "bibtex",
    });
    expect(out.citation).toMatch(/@misc/);
  });
});
