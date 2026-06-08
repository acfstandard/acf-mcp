import { describe, expect, it } from "vitest";
import { parseAcfUri } from "../../src/core/uri";

describe("parseAcfUri", () => {
  it("parses framework/principle", () => {
    expect(parseAcfUri("acf://framework/principle/P1")).toEqual({
      category: "framework_principle", id: "P1", locale: undefined,
    });
  });

  it("parses fiche with lang query", () => {
    expect(parseAcfUri("acf://fiche/ACF-03?lang=fr")).toEqual({
      category: "fiche", id: "ACF-03", locale: "fr",
    });
  });

  it("parses guide", () => {
    expect(parseAcfUri("acf://guide/ai-act")).toEqual({
      category: "guide", id: "ai-act", locale: undefined,
    });
  });

  it("parses whitepaper TOC", () => {
    expect(parseAcfUri("acf://whitepaper/toc")).toEqual({
      category: "whitepaper_toc", id: undefined, locale: undefined,
    });
  });

  it("parses whitepaper section", () => {
    expect(parseAcfUri("acf://whitepaper/section/governance-mandate")).toEqual({
      category: "whitepaper_section", id: "governance-mandate", locale: undefined,
    });
  });

  it("parses meta", () => {
    expect(parseAcfUri("acf://meta")).toEqual({
      category: "meta", id: undefined, locale: undefined,
    });
  });

  it("throws for non-acf scheme", () => {
    expect(() => parseAcfUri("https://example.com")).toThrow(/scheme/i);
  });
});
