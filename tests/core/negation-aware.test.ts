import { describe, expect, it } from "vitest";
import { negationAwareMatch } from "../../src/core/negation-aware";

describe("negationAwareMatch", () => {
  it("matches a plain pattern", () => {
    const r = negationAwareMatch("the agent runs credit scoring", ["credit", "scoring"]);
    expect(r.matched).toBe(true);
    expect(r.hits.length).toBeGreaterThanOrEqual(2);
  });

  it("ignores a negated FR pattern (n'... jamais)", () => {
    const r = negationAwareMatch(
      "l'agent n'analyse jamais les visages en temps réel",
      ["analyse les visages"],
    );
    expect(r.matched).toBe(false);
  });

  it("ignores 'never' in EN", () => {
    const r = negationAwareMatch(
      "the agent never analyses biometric data",
      ["analyses biometric"],
    );
    expect(r.matched).toBe(false);
  });

  it("ignores 'pas de' FR", () => {
    const r = negationAwareMatch("il n'y a pas de credit scoring", ["credit scoring"]);
    expect(r.matched).toBe(false);
  });

  it("hit positions are reported", () => {
    const r = negationAwareMatch("scoring de crédit", ["scoring"]);
    expect(r.hits[0]?.pattern).toBe("scoring");
    expect(r.hits[0]?.index).toBe(0);
  });
});
