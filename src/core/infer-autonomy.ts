import { AcfLevel, AutonomyInferenceSchema } from "./rule-types";
import { z } from "zod";

type Rules = z.infer<typeof AutonomyInferenceSchema>;

export interface AutonomyInferInput {
  human_approval_required: string;
  external_actions: string;
}

export function inferAutonomy(
  rules: Rules,
  input: AutonomyInferInput,
): { level: AcfLevel; rationale: string; rule_id: string } {
  for (const t of rules.thresholds) {
    const happroved = t.conditions["human_approval_required"] ?? [];
    const ext = t.conditions["external_actions"] ?? [];
    if (
      happroved.includes(input.human_approval_required) &&
      ext.includes(input.external_actions)
    ) {
      return {
        level: t.level,
        rationale: t.rationale_template,
        rule_id: `autonomy-inference.${t.level}`,
      };
    }
  }
  return {
    level: "N1",
    rationale:
      "No clear autonomy threshold matched the declared inputs; defaulting to N1 (supervised). Confirm with the team.",
    rule_id: "autonomy-inference.default-N1",
  };
}
