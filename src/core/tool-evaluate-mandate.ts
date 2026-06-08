import { z } from "zod";
import { AcfRegistry } from "./registry";
import { AcfLocaleSchema } from "./types";
import { aggregateConfidence } from "./confidence";
import { buildDoctrineFooter } from "./doctrine-footer";
import { ACF_REASON_DISCLAIMER } from "../constants/disclaimer";

export const EvaluateMandateInputSchema = z.object({
  mandate_text: z.string().min(50).max(10000),
  agent_purpose: z.string().min(10).max(500),
  deployment_context: z.string().max(500).optional(),
  locale: AcfLocaleSchema.optional(),
});
export type EvaluateMandateInput = z.infer<typeof EvaluateMandateInputSchema>;

interface MandateCheck {
  key: string;
  area: string;
  weight: number;
  matchers: RegExp[];
  remediation: string;
  fiche_reference: string;
}

const CHECKS: MandateCheck[] = [
  {
    key: "ddao_appointed",
    area: "Identification du DDAO",
    weight: 15,
    matchers: [/\bDDAO\b[^.]*:\s*\S{3,}/i, /\bDelegated Decision Agent Officer\b[^.]*:\s*\S{3,}/i],
    remediation: "Name an actual DDAO (person or role) — placeholders like 'TBD' are not acceptable.",
    fiche_reference: "ACF-12",
  },
  {
    key: "decision_perimeter",
    area: "Périmètre de décision",
    weight: 15,
    matchers: [/\b(decision perimeter|perimeter|périmètre)/i, /\b(allowed|autorisées?)\b/i],
    remediation: "Document the positive (allowed) and negative (forbidden) action lists.",
    fiche_reference: "ACF-03",
  },
  {
    key: "forbidden_actions",
    area: "Actions interdites",
    weight: 10,
    matchers: [/\b(forbidden|interdites?|not allowed|never)\b/i],
    remediation: "Add an explicit forbidden-actions list — without it, the agent drifts at the first uncovered case.",
    fiche_reference: "ACF-03",
  },
  {
    key: "escalation_thresholds",
    area: "Seuils d'escalade",
    weight: 15,
    matchers: [/\b(escalation|escalade)\b[^.]*\d/i, /\bthreshold|seuil/i],
    remediation: "Specify numeric and qualitative escalation thresholds.",
    fiche_reference: "ACF-09",
  },
  {
    key: "kill_switch",
    area: "Kill switch",
    weight: 15,
    matchers: [/\b(kill switch|suspension|revoke|révoquer|drill)\b/i],
    remediation: "Document the kill switch (levels, response times, drill frequency).",
    fiche_reference: "ACF-07",
  },
  {
    key: "audit_log",
    area: "Audit log / decision register",
    weight: 15,
    matchers: [/\b(audit log|decision register|registre|retention)\b/i],
    remediation: "Document the decision register format and retention.",
    fiche_reference: "ACF-05",
  },
  {
    key: "doctrine_version",
    area: "Doctrine version",
    weight: 10,
    matchers: [/\bACF®?[^.]*v\d/i, /\bdoctrine version\b/i],
    remediation: "Cite the ACF® doctrine version applied (e.g. 'ACF® v1.0').",
    fiche_reference: "ACF-00",
  },
  {
    key: "sign_off",
    area: "Sign-off",
    weight: 5,
    matchers: [/\b(sign-off|sign off|signature|approuvé)\b/i],
    remediation: "List the sign-off roles (DDAO + DPO if PII + CISO if attack surface + Legal if exposure).",
    fiche_reference: "ACF-12",
  },
];

export async function handleEvaluateMandateTool(
  registry: AcfRegistry,
  rawInput: unknown,
) {
  const input = EvaluateMandateInputSchema.parse(rawInput);
  const rulesMeta = await registry.rules.loadRulesMeta();

  const strengths: string[] = [];
  const gaps: { area: string; severity: "low" | "medium" | "high" | "critical"; description: string }[] = [];
  const additions: { section: string; suggested_text: string; fiche_reference: string }[] = [];
  let score = 0;

  for (const check of CHECKS) {
    const matched = check.matchers.every((m) => m.test(input.mandate_text));
    if (matched) {
      score += check.weight;
      strengths.push(`${check.area}: present.`);
    } else {
      gaps.push({
        area: check.area,
        severity: check.weight >= 15 ? "high" : check.weight >= 10 ? "medium" : "low",
        description: `${check.area} missing or insufficient.`,
      });
      additions.push({
        section: check.area,
        suggested_text: check.remediation,
        fiche_reference: check.fiche_reference,
      });
    }
  }

  const tbdHits = /\bTBD\b|\bà compléter\b|\?\?\?/i.test(input.mandate_text);
  if (tbdHits) {
    gaps.push({
      area: "Placeholders",
      severity: "critical",
      description: "Mandate contains 'TBD' / placeholders — it is not signable in this state.",
    });
    score = Math.max(0, score - 20);
  }

  let verdict: "approve" | "approve_with_changes" | "reject";
  if (score >= 80) verdict = "approve";
  else if (score >= 50) verdict = "approve_with_changes";
  else verdict = "reject";

  const footer = buildDoctrineFooter({
    frameworkVersion: registry.meta.framework_version,
    rulesVersion: rulesMeta.rules_version,
    contentHash: registry.meta.content_hash,
    archiveUrl: registry.meta.permanent_archive_url,
  });

  return {
    verdict,
    rationale: verdict === "approve"
      ? "All canonical mandate sections are present; no critical placeholders detected."
      : verdict === "approve_with_changes"
        ? "The mandate covers the core but misses one or more sections. Address the additions below before DDAO sign-off."
        : "The mandate misses too many canonical sections (or contains placeholders) to be signable.",
    strengths,
    identified_gaps: gaps,
    required_additions: additions,
    reference_fiches: ["ACF-03", "ACF-07", "ACF-09", "ACF-12"],
    acf_compliance_score: score,
    confidence: aggregateConfidence({
      ruleBaseConfidence: "medium",
      enumProvided: false,
      contextFieldsProvided: input.deployment_context ? 1 : 0,
      contradictions: 0,
    }),
    assumptions: ["Mandate evaluation uses an 8-check canonical baseline — sector-specific extras not yet implemented."],
    gaps_to_validate: [
      "Confirm with the DDAO that the named escalation thresholds reflect real organisational SLAs.",
      "Confirm that the kill switch drill has been run in the last quarter.",
    ],
    requires_human_review: true as const,
    rationale_per_rule: CHECKS.map((c) => ({
      rule_id: `evaluate-mandate.${c.key}`,
      rule_version: rulesMeta.rules_version,
      fired: c.matchers.every((m) => m.test(input.mandate_text)),
      evidence: `${c.area} check`,
    })),
    ...footer,
    disclaimer: ACF_REASON_DISCLAIMER,
  };
}
