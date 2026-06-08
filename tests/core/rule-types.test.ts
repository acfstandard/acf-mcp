import { describe, expect, it } from "vitest";
import {
  TriggerSchema,
  RuleCategorySchema,
  RulesMetaSchema,
  AiActAnnexIIISchema,
  GpaiTriggersSchema,
  CriticalityMatrixSchema,
  AutonomyInferenceSchema,
  DdaoControlsMappingSchema,
  SignOffMatrixSchema,
  GdprQualificationSchema,
  AiActRolesSchema,
} from "../../src/core/rule-types";

describe("rule-types", () => {
  it("TriggerSchema accepts minimal trigger", () => {
    expect(() =>
      TriggerSchema.parse({
        keyword_patterns: ["credit", "scoring"],
        negation_aware: true,
      }),
    ).not.toThrow();
  });

  it("RuleCategorySchema requires id, title, triggers, obligations", () => {
    expect(() =>
      RuleCategorySchema.parse({
        id: "annex-iii-5b",
        title: "Credit scoring",
        triggers: { keyword_patterns: ["credit"], negation_aware: true },
        obligations: ["art-9", "art-10"],
        fiches: ["ACF-02"],
        confidence_base: "high",
        requires_human_review: true,
      }),
    ).not.toThrow();
  });

  it("RulesMetaSchema validates metadata block", () => {
    expect(() =>
      RulesMetaSchema.parse({
        rules_version: "2026-06",
        last_update: "2026-06-06",
        applicable_jurisdictions: ["eu"],
      }),
    ).not.toThrow();
  });

  it("AutonomyInferenceSchema validates the autonomy rules file", () => {
    expect(() =>
      AutonomyInferenceSchema.parse({
        version: "2026-06",
        last_update: "2026-06-06",
        thresholds: [
          {
            level: "N2",
            conditions: { human_approval_required: ["sometimes"] },
            rationale_template: "Conditional execution",
          },
        ],
      }),
    ).not.toThrow();
  });

  it("CriticalityMatrixSchema validates", () => {
    expect(() =>
      CriticalityMatrixSchema.parse({
        version: "2026-06",
        last_update: "2026-06-06",
        cells: [
          {
            personal_data_level: "sensitive_special",
            financial_exposure: "high_corporate",
            sector_modifier: 0,
            score: "critical",
            rationale_template: "Sensitive data + high financial exposure",
          },
        ],
      }),
    ).not.toThrow();
  });

  it("schemas accept empty arrays where allowed", () => {
    expect(() =>
      AiActAnnexIIISchema.parse({
        version: "2026-06",
        last_update: "2026-06-06",
        applicable_dates: [],
        categories: [],
      }),
    ).not.toThrow();
    expect(() =>
      GpaiTriggersSchema.parse({
        version: "2026-06",
        last_update: "2026-06-06",
        triggers: { keyword_patterns: [], negation_aware: true },
        obligations: [],
      }),
    ).not.toThrow();
    expect(() =>
      SignOffMatrixSchema.parse({
        version: "2026-06",
        last_update: "2026-06-06",
        rules: [],
      }),
    ).not.toThrow();
    expect(() =>
      GdprQualificationSchema.parse({
        version: "2026-06",
        last_update: "2026-06-06",
        cases: [],
      }),
    ).not.toThrow();
    expect(() =>
      AiActRolesSchema.parse({
        version: "2026-06",
        last_update: "2026-06-06",
        rules: [],
      }),
    ).not.toThrow();
    expect(() =>
      DdaoControlsMappingSchema.parse({
        version: "2026-06",
        last_update: "2026-06-06",
        mappings: [],
      }),
    ).not.toThrow();
  });
});
