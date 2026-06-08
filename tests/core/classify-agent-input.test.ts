import { describe, expect, it } from "vitest";
import {
  ClassifyAgentInputSchema,
  extractFlags,
  extractEnumHints,
} from "../../src/core/classify-agent-input";

const baseline = {
  name: "Sample agent",
  description:
    "We deploy an internal copilot that reorders stock within a price window. No personal data.",
  decisions_taken: ["place_order_within_window", "alert_stockout"],
  human_approval_required: "sometimes",
  personal_data_level: "none",
  financial_exposure: "medium_contract",
  external_actions: "limited_write",
  gpai_used: true,
  usage_audience: "internal",
};

describe("ClassifyAgentInputSchema", () => {
  it("validates the baseline 10-field input", () => {
    expect(() => ClassifyAgentInputSchema.parse(baseline)).not.toThrow();
  });

  it("accepts optional ai_act_triggers + processing_purposes", () => {
    expect(() =>
      ClassifyAgentInputSchema.parse({
        ...baseline,
        ai_act_triggers: ["none"],
        processing_purposes: ["other"],
      }),
    ).not.toThrow();
  });

  it("rejects too-short description", () => {
    expect(() =>
      ClassifyAgentInputSchema.parse({ ...baseline, description: "short" }),
    ).toThrow();
  });

  it("extractFlags emits 4 canonical flags", () => {
    const flags = extractFlags(ClassifyAgentInputSchema.parse(baseline));
    expect(flags).toContain("financial_exposure:medium_contract");
    expect(flags).toContain("personal_data_level:none");
    expect(flags).toContain("external_actions:limited_write");
    expect(flags).toContain("human_approval_required:sometimes");
  });

  it("extractEnumHints emits expected keys when provided", () => {
    const parsed = ClassifyAgentInputSchema.parse({
      ...baseline,
      ai_act_triggers: ["credit_scoring"],
      processing_purposes: ["core_financial"],
    });
    const hints = extractEnumHints(parsed);
    expect(hints["ai_act_triggers"]).toContain("credit_scoring");
    expect(hints["processing_purposes"]).toContain("core_financial");
  });
});
