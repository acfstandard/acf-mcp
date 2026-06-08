import { describe, expect, it } from "vitest";
import { aggregateConfidence } from "../../src/core/confidence";

describe("aggregateConfidence", () => {
  it("returns high when all signals are present and aligned", () => {
    expect(
      aggregateConfidence({
        ruleBaseConfidence: "high",
        enumProvided: true,
        contextFieldsProvided: 4,
        contradictions: 0,
      }),
    ).toBe("high");
  });

  it("downgrades when enums absent and few context fields", () => {
    expect(
      aggregateConfidence({
        ruleBaseConfidence: "medium",
        enumProvided: false,
        contextFieldsProvided: 0,
        contradictions: 0,
      }),
    ).toBe("low");
  });

  it("downgrades on contradictions", () => {
    expect(
      aggregateConfidence({
        ruleBaseConfidence: "high",
        enumProvided: true,
        contextFieldsProvided: 4,
        contradictions: 1,
      }),
    ).toBe("medium");
  });

  it("contradictions always cap at medium", () => {
    expect(
      aggregateConfidence({
        ruleBaseConfidence: "high",
        enumProvided: true,
        contextFieldsProvided: 4,
        contradictions: 3,
      }),
    ).toBe("low");
  });
});
