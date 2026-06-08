import { describe, expect, it } from "vitest";
import { evaluateTrigger } from "../../src/core/trigger-eval";

describe("evaluateTrigger", () => {
  it("fires on a positive keyword match", () => {
    const r = evaluateTrigger(
      {
        keyword_patterns: ["credit", "scoring"],
        negation_aware: true,
      },
      { text: "we built a credit scoring agent", enums: {}, flags: [] },
    );
    expect(r.fired).toBe(true);
    expect(r.evidence).toContain("keyword:credit");
  });

  it("does NOT fire on a negated keyword", () => {
    const r = evaluateTrigger(
      { keyword_patterns: ["facial recognition"], negation_aware: true },
      {
        text: "the agent never performs facial recognition",
        enums: {},
        flags: [],
      },
    );
    expect(r.fired).toBe(false);
  });

  it("fires on enum_match", () => {
    const r = evaluateTrigger(
      {
        keyword_patterns: [],
        negation_aware: true,
        enum_match: { ai_act_triggers: ["credit_scoring"] },
      },
      { text: "irrelevant text", enums: { ai_act_triggers: ["credit_scoring"] }, flags: [] },
    );
    expect(r.fired).toBe(true);
    expect(r.evidence).toContain("enum:ai_act_triggers=credit_scoring");
  });

  it("fires on structured_flags", () => {
    const r = evaluateTrigger(
      {
        keyword_patterns: [],
        negation_aware: true,
        structured_flags: ["financial_exposure:high_corporate"],
      },
      { text: "", enums: {}, flags: ["financial_exposure:high_corporate"] },
    );
    expect(r.fired).toBe(true);
  });

  it("does not fire when nothing matches", () => {
    const r = evaluateTrigger(
      { keyword_patterns: ["xyz"], negation_aware: true },
      { text: "irrelevant", enums: {}, flags: [] },
    );
    expect(r.fired).toBe(false);
  });
});
