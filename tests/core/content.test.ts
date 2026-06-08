import path from "node:path";
import { describe, expect, it } from "vitest";
import { ContentLoader } from "../../src/core/content";

const FIXTURES = path.resolve(__dirname, "../fixtures/content");

describe("ContentLoader", () => {
  const loader = new ContentLoader({ contentRoot: FIXTURES });

  it("loads meta", async () => {
    const meta = await loader.loadMeta();
    expect(meta.framework_version).toBe("1.0");
    expect(meta.locales).toContain("fr");
  });

  it("loads a fiche in requested locale", async () => {
    const fiche = await loader.loadFiche("ACF-03", "fr");
    expect(fiche.frontmatter.code).toBe("ACF-03");
    expect(fiche.frontmatter.title).toBe("Constitution Agentique");
    expect(fiche.served_locale).toBe("fr");
    expect(fiche.is_fallback).toBe(false);
    expect(fiche.body).toContain("Constitution Agentique");
  });

  it("falls back to EN when requested locale is missing", async () => {
    const fiche = await loader.loadFiche("ACF-03", "ja");
    expect(fiche.served_locale).toBe("en");
    expect(fiche.is_fallback).toBe(true);
  });

  it("throws when fiche code does not exist in any locale", async () => {
    await expect(loader.loadFiche("ACF-99", "en")).rejects.toThrow(/not found/i);
  });

  it("loads principles list", async () => {
    const principles = await loader.loadPrinciples();
    expect(principles).toHaveLength(1);
    expect(principles[0]?.code).toBe("P1");
  });

  it("loadGlossaryEntry finds DDAO by term (case-insensitive)", async () => {
    const result = await loader.loadGlossaryEntry("ddao", "en");
    expect(result).not.toBeNull();
    expect(result?.entry.term).toBe("DDAO");
    expect(result?.served_locale).toBe("en");
    expect(result?.is_fallback).toBe(false);
  });

  it("loadGlossaryEntry finds DDAO by full expansion (case-insensitive)", async () => {
    const result = await loader.loadGlossaryEntry(
      "delegated decision agent officer",
      "en",
    );
    expect(result?.entry.term).toBe("DDAO");
  });

  it("loadGlossaryEntry returns null for an unknown term", async () => {
    const result = await loader.loadGlossaryEntry("xyznotaterm", "en");
    expect(result).toBeNull();
  });
});
