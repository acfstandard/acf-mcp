import { z } from "zod";
import {
  AiActRolesSchema, GdprQualificationSchema,
  Confidence,
} from "./rule-types";
import { evaluateTrigger, TriggerInput } from "./trigger-eval";

type AiActRoles = z.infer<typeof AiActRolesSchema>;
type GdprRules = z.infer<typeof GdprQualificationSchema>;

export interface RoleInferOut {
  role: string;
  confidence: Confidence;
  rationale: string;
  rule_id: string;
  evidence: string[];
}

export function inferAiActRole(
  rules: AiActRoles,
  input: TriggerInput,
): RoleInferOut {
  for (const r of rules.rules) {
    const fired = evaluateTrigger(r.triggers, input);
    if (fired.fired) {
      return {
        role: r.role,
        confidence: r.confidence_base,
        rationale: r.rationale_template,
        rule_id: `ai-act-roles.${r.id}`,
        evidence: fired.evidence,
      };
    }
  }
  return {
    role: "not_applicable",
    confidence: "low",
    rationale:
      "No AI Act role rule fired with the declared inputs. Defaulting to not_applicable — confirm manually.",
    rule_id: "ai-act-roles.default-na",
    evidence: [],
  };
}

export function inferGdprRole(
  rules: GdprRules,
  input: TriggerInput,
): RoleInferOut {
  for (const c of rules.cases) {
    const fired = evaluateTrigger(c.triggers, input);
    if (fired.fired) {
      return {
        role: c.role,
        confidence: c.confidence_base,
        rationale: c.rationale_template,
        rule_id: `gdpr-qualification.${c.id}`,
        evidence: fired.evidence,
      };
    }
  }
  return {
    role: "not_applicable",
    confidence: "low",
    rationale:
      "No GDPR qualification rule fired; defaulting to not_applicable — confirm manually whether any PII transits the agent.",
    rule_id: "gdpr-qualification.default-na",
    evidence: [],
  };
}
