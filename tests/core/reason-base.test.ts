import { describe, expect, it } from "vitest";
import {
  ReasonFooterSchema,
  RationalePerRuleSchema,
} from "../../src/core/reason-base";

describe("reason-base schemas", () => {
  it("ReasonFooterSchema requires all 7 fields", () => {
    expect(() =>
      ReasonFooterSchema.parse({
        confidence: "medium",
        assumptions: [],
        gaps_to_validate: [],
        requires_human_review: true,
        rationale_per_rule: [],
        doctrine_version: "ACF framework v1.0 / rules 2026-06",
        doctrine_hash: "sha256:abc",
        doctrine_archive_url: "https://archive.acfstandard.com/doctrine/v1.0/",
        regulatory_snapshot: "EU AI Act + GDPR + DORA + NIS2 + ISO 42001 as of 2026-06-07",
        generated_at: "2026-06-07T00:00:00Z",
        disclaimer: "Preliminary qualification produced by the ACF® deterministic engine. Not legal advice. Human review required. Do not use for autonomous regulatory decision-making.",
      }),
    ).not.toThrow();
  });

  it("rejects requires_human_review !== true", () => {
    expect(() =>
      ReasonFooterSchema.parse({
        confidence: "medium",
        assumptions: [],
        gaps_to_validate: [],
        requires_human_review: false,
        rationale_per_rule: [],
        doctrine_version: "x",
        doctrine_hash: "x",
        doctrine_archive_url: "https://x.com/",
        regulatory_snapshot: "x",
        generated_at: "2026-06-07T00:00:00Z",
        disclaimer: "Preliminary qualification produced by the ACF® deterministic engine. Not legal advice. Human review required. Do not use for autonomous regulatory decision-making.",
      }),
    ).toThrow();
  });

  it("RationalePerRuleSchema validates", () => {
    expect(() =>
      RationalePerRuleSchema.parse({
        rule_id: "ai-act-annex-iii.credit-scoring",
        rule_version: "2026-06",
        fired: true,
        evidence: "keyword:credit",
      }),
    ).not.toThrow();
  });
});
