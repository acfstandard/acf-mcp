import { describe, expect, it } from "vitest";
import { negotiateLocale, fallbackChain } from "../../src/core/locale";

describe("core/locale", () => {
  describe("negotiateLocale", () => {
    it("prefers explicit param when provided and supported", () => {
      expect(negotiateLocale({ explicit: "fr" })).toBe("fr");
    });

    it("ignores unsupported explicit param and falls through", () => {
      expect(
        negotiateLocale({ explicit: "xx", acceptLanguage: "en-US,en;q=0.9" }),
      ).toBe("en");
    });

    it("parses Accept-Language header", () => {
      expect(
        negotiateLocale({ acceptLanguage: "fr-FR,fr;q=0.9,en;q=0.8" }),
      ).toBe("fr");
    });

    it("uses env var when no other signal", () => {
      expect(negotiateLocale({ envLocale: "ja" })).toBe("ja");
    });

    it("falls back to 'en' when nothing matches", () => {
      expect(negotiateLocale({})).toBe("en");
      expect(negotiateLocale({ acceptLanguage: "xx-YY" })).toBe("en");
    });
  });

  describe("fallbackChain", () => {
    it("for an unsupported locale returns [requested, en, fr]", () => {
      expect(fallbackChain("ja")).toEqual(["ja", "en", "fr"]);
    });

    it("for 'en' deduplicates to [en, fr]", () => {
      expect(fallbackChain("en")).toEqual(["en", "fr"]);
    });

    it("for 'fr' returns [fr, en]", () => {
      expect(fallbackChain("fr")).toEqual(["fr", "en"]);
    });
  });
});
