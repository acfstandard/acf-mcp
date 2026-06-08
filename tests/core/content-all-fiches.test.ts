import path from "node:path";
import { describe, expect, it } from "vitest";
import { ContentLoader } from "../../src/core/content";

const CONTENT = path.resolve(__dirname, "../../content");
const loader = new ContentLoader({ contentRoot: CONTENT });

const ALL_CODES = Array.from({ length: 17 }, (_, i) =>
  `ACF-${String(i).padStart(2, "0")}`,
);

describe("content fixtures — all 17 fiches", () => {
  for (const code of ALL_CODES) {
    it(`loads ${code} in FR`, async () => {
      const fiche = await loader.loadFiche(code, "fr");
      expect(fiche.frontmatter.code).toBe(code);
    });
    it(`loads ${code} in EN`, async () => {
      const fiche = await loader.loadFiche(code, "en");
      expect(fiche.frontmatter.code).toBe(code);
    });
  }
});
