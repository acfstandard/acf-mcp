import path from "node:path";
import { describe, expect, it } from "vitest";
import { collectSearchDocs, SearchDocSchema } from "../../src/core/search-doc";
import { ContentLoader } from "../../src/core/content";

describe("search-doc", () => {
  it("collectSearchDocs returns docs from fixture content", async () => {
    const loader = new ContentLoader({
      contentRoot: path.resolve(__dirname, "../../content"),
    });
    const docs = await collectSearchDocs(loader);
    expect(docs.length).toBeGreaterThan(20);
    for (const doc of docs) {
      expect(() => SearchDocSchema.parse(doc)).not.toThrow();
    }
  });

  it("docs include principles, fiches, glossary entries", async () => {
    const loader = new ContentLoader({
      contentRoot: path.resolve(__dirname, "../../content"),
    });
    const docs = await collectSearchDocs(loader);
    const categories = new Set(docs.map((d) => d.category));
    expect(categories.has("principle")).toBe(true);
    expect(categories.has("fiche")).toBe(true);
    expect(categories.has("glossary")).toBe(true);
  });
});
