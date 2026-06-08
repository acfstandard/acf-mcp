import { describe, expect, it } from "vitest";
import {
  AcfLocaleSchema,
  DdaoSchema,
  FicheFrontmatterSchema,
  GlossaryEntrySchema,
  GuideFrontmatterSchema,
  LocalizedStringSchema,
  MetaSchema,
  PrincipleSchema,
} from "../../src/core/types";

describe("core/types", () => {
  it("AcfLocaleSchema accepts a known locale", () => {
    expect(() => AcfLocaleSchema.parse("fr")).not.toThrow();
    expect(() => AcfLocaleSchema.parse("en")).not.toThrow();
    expect(() => AcfLocaleSchema.parse("ja")).not.toThrow();
  });

  it("AcfLocaleSchema rejects an unknown locale", () => {
    expect(() => AcfLocaleSchema.parse("xx")).toThrow();
  });

  it("PrincipleSchema validates a minimal principle", () => {
    const ok = PrincipleSchema.parse({
      id: "P1",
      code: "P1",
      title: { fr: "Souveraineté décisionnelle", en: "Decision Sovereignty" },
      summary: { fr: "...", en: "..." },
      doctrine: { fr: "...markdown...", en: "...markdown..." },
      related_fiches: ["ACF-00", "ACF-03", "ACF-12"],
      related_dimensions: ["D1", "D4"],
    });
    expect(ok.code).toBe("P1");
  });

  it("FicheFrontmatterSchema requires the ACF-XX code format", () => {
    expect(() =>
      FicheFrontmatterSchema.parse({
        code: "ACF-3",
        slug: "x",
        title: "t",
        order: 3,
        keywords: [],
        version: "1.0",
      }),
    ).toThrow();
    expect(() =>
      FicheFrontmatterSchema.parse({
        code: "ACF-03",
        slug: "constitution",
        title: "Constitution",
        order: 3,
        keywords: ["x"],
        version: "1.0",
      }),
    ).not.toThrow();
  });

  it("GuideFrontmatterSchema validates a guide", () => {
    expect(() =>
      GuideFrontmatterSchema.parse({
        regulation: "ai-act",
        title: "Guide AI Act",
        version: "2026-06",
        last_update: "2026-06-06",
      }),
    ).not.toThrow();
  });

  it("GlossaryEntrySchema validates a glossary entry", () => {
    expect(() =>
      GlossaryEntrySchema.parse({
        term: "DDAO",
        definition: "...",
      }),
    ).not.toThrow();
  });

  it("MetaSchema validates content meta", () => {
    expect(() =>
      MetaSchema.parse({
        framework_version: "1.0",
        content_build: "2026-06-06T00:00:00Z",
        content_hash: "sha256:abc",
        permanent_archive_url: "https://archive.acfstandard.com/doctrine/v1.0/",
        rules_version: "2026-06",
        locales: ["fr", "en"],
        fallback_locale: "en",
      }),
    ).not.toThrow();
  });

  it("DdaoSchema rejects an expansion typo (IP guardrail)", () => {
    expect(() =>
      DdaoSchema.parse({
        title: { fr: "DDAO", en: "DDAO" },
        expansion: "Delegate Decision Agent Officer", // missing 'd'
        definition: { fr: "x", en: "x" },
        responsibilities: { fr: "x", en: "x" },
        not_to_be_confused_with: { fr: "x", en: "x" },
      }),
    ).toThrow();
  });

  it("FicheFrontmatterSchema accepts ACF-16 (max valid) and rejects ACF-17", () => {
    expect(() =>
      FicheFrontmatterSchema.parse({
        code: "ACF-16",
        slug: "doctrine-update",
        title: "Doctrine update",
        order: 16,
        keywords: [],
        version: "1.0",
      }),
    ).not.toThrow();
    expect(() =>
      FicheFrontmatterSchema.parse({
        code: "ACF-17",
        slug: "x",
        title: "x",
        order: 17,
        keywords: [],
        version: "1.0",
      }),
    ).toThrow();
  });

  it("LocalizedStringSchema requires both fr and en, accepts extra locales", () => {
    expect(() => LocalizedStringSchema.parse({ fr: "x" })).toThrow();
    expect(() =>
      LocalizedStringSchema.parse({ fr: "x", en: "y", es: "z" }),
    ).not.toThrow();
  });
});
