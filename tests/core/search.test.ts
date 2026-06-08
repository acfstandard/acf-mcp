import path from "node:path";
import { describe, expect, it, beforeAll } from "vitest";
import { SearchEngine } from "../../src/core/search";

const INDEX_PATH = path.resolve(__dirname, "../../dist/search-index.json");

describe("SearchEngine", () => {
  let engine: SearchEngine;

  beforeAll(async () => {
    engine = await SearchEngine.fromFile(INDEX_PATH);
  });

  it("finds 'souveraineté' in FR principles", () => {
    const hits = engine.search({ query: "souveraineté", scope: "all", locale: "fr", limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.uri).toMatch(/principle/);
  });

  it("finds 'sovereignty' in EN principles", () => {
    const hits = engine.search({ query: "sovereignty", scope: "all", locale: "en", limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
  });

  it("scope=fiche restricts to fiches", () => {
    const hits = engine.search({ query: "constitution", scope: "fiche", locale: "fr", limit: 10 });
    for (const h of hits) expect(h.category).toBe("fiche");
  });

  it("scope=glossary returns glossary entries", () => {
    const hits = engine.search({ query: "DDAO", scope: "glossary", locale: "en", limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.category).toBe("glossary");
  });

  it("limit clamps", () => {
    const hits = engine.search({ query: "agent", scope: "all", locale: "fr", limit: 2 });
    expect(hits.length).toBeLessThanOrEqual(2);
  });
});
