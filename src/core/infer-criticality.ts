import { Criticality, CriticalityMatrixSchema } from "./rule-types";
import { z } from "zod";

type Matrix = z.infer<typeof CriticalityMatrixSchema>;

export interface CriticalityInferInput {
  personal_data_level: "none" | "standard" | "sensitive_special";
  financial_exposure:
    | "none" | "low_operation" | "medium_contract" | "high_corporate";
}

export function inferCriticality(
  matrix: Matrix,
  input: CriticalityInferInput,
): {
  score: Criticality;
  rationale: string;
  matrix_ref: string;
  rule_id: string;
} {
  for (const cell of matrix.cells) {
    if (
      cell.personal_data_level === input.personal_data_level &&
      cell.financial_exposure === input.financial_exposure
    ) {
      return {
        score: cell.score,
        rationale: cell.rationale_template,
        matrix_ref: `cell(${cell.personal_data_level}, ${cell.financial_exposure})`,
        rule_id: `criticality-matrix.${cell.personal_data_level}-${cell.financial_exposure}`,
      };
    }
  }
  return {
    score: "medium",
    rationale:
      "Combination of personal_data_level + financial_exposure not yet calibrated; defaulting to medium for safety.",
    matrix_ref: "default-medium",
    rule_id: "criticality-matrix.default-medium",
  };
}
