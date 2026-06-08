import { describe, expect, it } from "vitest";
import {
  scanForbiddenPatterns,
  FORBIDDEN_PATTERNS,
} from "../../scripts/validate-content";

describe("validate-content forbidden patterns", () => {
  it("catches INPI number 5224709", () => {
    const findings = scanForbiddenPatterns("test.md", "ref 5224709");
    expect(findings.length).toBeGreaterThan(0);
  });

  it("catches the word brevet", () => {
    const findings = scanForbiddenPatterns("test.md", "Le brevet est déposé");
    expect(findings.some((f) => f.pattern.includes("brevet"))).toBe(true);
  });

  it("catches Decision Engine mention", () => {
    const findings = scanForbiddenPatterns(
      "test.md",
      "Powered by our Decision Engine",
    );
    expect(findings.some((f) => f.pattern.toLowerCase().includes("decision engine"))).toBe(
      true,
    );
  });

  it("does NOT flag a clean fiche", () => {
    const findings = scanForbiddenPatterns(
      "ACF-00.fr.md",
      "Les 4 principes fondateurs de l'ACF®",
    );
    expect(findings).toEqual([]);
  });

  it("exposes the canonical patterns list", () => {
    expect(FORBIDDEN_PATTERNS).toBeDefined();
    expect(FORBIDDEN_PATTERNS.length).toBeGreaterThan(0);
  });

  it("catches Souveraineté Agentique at end of string (no trailing char)", () => {
    const findings = scanForbiddenPatterns(
      "test.md",
      "Inspired by Souveraineté Agentique",
    );
    expect(findings.some((f) => f.pattern.includes("Souveraineté"))).toBe(true);
  });

  it("does NOT flag Souveraineté Agentique® (registered mark)", () => {
    const findings = scanForbiddenPatterns(
      "test.md",
      "ACF® is part of the Souveraineté Agentique® portfolio.",
    );
    expect(findings).toEqual([]);
  });
});
