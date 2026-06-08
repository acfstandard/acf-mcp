import { z } from "zod";
import { SignOffMatrixSchema } from "./rule-types";

type Matrix = z.infer<typeof SignOffMatrixSchema>;

export interface SignOffInput {
  criticality: "low" | "medium" | "high" | "critical";
  personal_data_level: "none" | "standard" | "sensitive_special";
  financial_exposure:
    | "none" | "low_operation" | "medium_contract" | "high_corporate";
}

export interface SignOffOut {
  required: {
    security: boolean;
    privacy: boolean;
    compliance: boolean;
    legal: boolean;
    business_sponsor: boolean;
    board: boolean;
  };
  rule_id: string;
}

const DEFAULT: SignOffOut["required"] = {
  security: false,
  privacy: false,
  compliance: false,
  legal: false,
  business_sponsor: true,
  board: false,
};

export function inferSignOff(matrix: Matrix, input: SignOffInput): SignOffOut {
  // Pick the first rule that matches exactly (criticality + PII + financial)
  for (const rule of matrix.rules) {
    if (
      rule.criticality === input.criticality &&
      rule.personal_data_level === input.personal_data_level &&
      rule.financial_exposure === input.financial_exposure
    ) {
      return {
        required: rule.required,
        rule_id: `sign-off-matrix.${rule.criticality}-${rule.personal_data_level}-${rule.financial_exposure}`,
      };
    }
  }
  // Fallback: pick the closest by criticality (escalate on PII/financial unknown)
  for (const rule of matrix.rules) {
    if (rule.criticality === input.criticality) {
      return {
        required: rule.required,
        rule_id: `sign-off-matrix.${rule.criticality}-fallback`,
      };
    }
  }
  return { required: DEFAULT, rule_id: "sign-off-matrix.default" };
}
