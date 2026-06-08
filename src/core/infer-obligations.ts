import { z } from "zod";
import {
  AiActAnnexIIISchema, AiActAnnexISchema, GpaiTriggersSchema,
} from "./rule-types";
import { evaluateTrigger, TriggerInput } from "./trigger-eval";

type AnnexIII = z.infer<typeof AiActAnnexIIISchema>;
type AnnexI = z.infer<typeof AiActAnnexISchema>;
type Gpai = z.infer<typeof GpaiTriggersSchema>;

export interface ObligationItem {
  article: string;
  requirement: string;
  applicable_date: string;
}

export interface ObligationsInferOut {
  firedCategories: {
    id: string;
    title: string;
    obligations: string[];
    fiches: string[];
    confidence_base: "low" | "medium" | "high";
    evidence: string[];
    source: "annex-iii" | "annex-i";
  }[];
  gpaiObligations: ObligationItem[];
  rationale_per_rule: {
    rule_id: string;
    rule_version: string;
    fired: boolean;
    evidence: string;
  }[];
}

export interface InferRulesBundle {
  annexIII: AnnexIII;
  annexI: AnnexI;
  gpai: Gpai;
}

export function inferAiActObligations(
  bundle: InferRulesBundle,
  input: TriggerInput,
): ObligationsInferOut {
  const out: ObligationsInferOut = {
    firedCategories: [],
    gpaiObligations: [],
    rationale_per_rule: [],
  };

  /* Annex III */
  for (const cat of bundle.annexIII.categories) {
    const r = evaluateTrigger(cat.triggers, input);
    out.rationale_per_rule.push({
      rule_id: `ai-act-annex-iii.${cat.id}`,
      rule_version: bundle.annexIII.version,
      fired: r.fired,
      evidence: r.evidence.join("; "),
    });
    if (r.fired) {
      out.firedCategories.push({
        id: cat.id,
        title: cat.title,
        obligations: cat.obligations,
        fiches: cat.fiches,
        confidence_base: cat.confidence_base,
        evidence: r.evidence,
        source: "annex-iii",
      });
    }
  }

  /* Annex I */
  for (const cat of bundle.annexI.categories) {
    const r = evaluateTrigger(cat.triggers, input);
    out.rationale_per_rule.push({
      rule_id: `ai-act-annex-i.${cat.id}`,
      rule_version: bundle.annexI.version,
      fired: r.fired,
      evidence: r.evidence.join("; "),
    });
    if (r.fired) {
      out.firedCategories.push({
        id: cat.id,
        title: cat.title,
        obligations: cat.obligations,
        fiches: cat.fiches,
        confidence_base: cat.confidence_base,
        evidence: r.evidence,
        source: "annex-i",
      });
    }
  }

  /* GPAI */
  const gpaiR = evaluateTrigger(bundle.gpai.triggers, input);
  out.rationale_per_rule.push({
    rule_id: "gpai-triggers",
    rule_version: bundle.gpai.version,
    fired: gpaiR.fired,
    evidence: gpaiR.evidence.join("; "),
  });
  if (gpaiR.fired) {
    out.gpaiObligations = bundle.gpai.obligations
      .filter((o) => !o.systemic_risk_only)
      .map((o) => ({
        article: o.article,
        requirement: o.requirement,
        applicable_date: o.applicable_date,
      }));
  }

  return out;
}
