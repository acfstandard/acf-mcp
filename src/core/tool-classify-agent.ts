import { z } from "zod";
import { AcfRegistry } from "./registry";
import {
  ClassifyAgentInputSchema, extractFlags, extractEnumHints,
} from "./classify-agent-input";
import { inferAutonomy } from "./infer-autonomy";
import { inferCriticality } from "./infer-criticality";
import { inferAiActObligations } from "./infer-obligations";
import { inferAiActRole, inferGdprRole } from "./infer-roles";
import { inferSignOff } from "./infer-sign-off";
import { inferDdaoControls } from "./infer-controls";
import { aggregateConfidence } from "./confidence";
import { buildDoctrineFooter } from "./doctrine-footer";
import { ACF_REASON_DISCLAIMER } from "../constants/disclaimer";

export const CLASSIFY_AGENT_CONVERSION_CTA =
  "Generate the full auditable PDF report on https://acfstandard.com/compliance?ref=mcp";

export interface ClassifyAgentOutput {
  acf_level: { level: "N0" | "N1" | "N2" | "N3"; rationale: string };
  criticality: {
    score: "low" | "medium" | "high" | "critical";
    rationale: string;
    matrix_ref: string;
  };
  regulatory_qualifications: {
    likely_ai_act_role: string;
    likely_gdpr_status: string;
  };
  regulatory_qualifications_confidence: {
    likely_ai_act_role: "low" | "medium" | "high";
    likely_gdpr_status: "low" | "medium" | "high";
  };
  ai_act_obligations: {
    pre_go_live: { article: string; requirement: string; applicable_date: string }[];
    continuous: { article: string; requirement: string; applicable_date: string }[];
    on_incident: { article: string; requirement: string; applicable_date: string }[];
  };
  applicable_fiches: { code: string; why: string }[];
  recommended_controls: string[];
  ddao_controls: string[];
  ddao_escalation: { required: boolean; trigger_thresholds: string[] };
  sign_off_required: {
    security: boolean; privacy: boolean; compliance: boolean;
    legal: boolean; business_sponsor: boolean; board: boolean;
  };

  /* footer + traceability */
  confidence: "low" | "medium" | "high";
  assumptions: string[];
  gaps_to_validate: string[];
  requires_human_review: true;
  rationale_per_rule: {
    rule_id: string; rule_version: string; fired: boolean; evidence: string;
  }[];
  doctrine_version: string;
  doctrine_hash: string;
  doctrine_archive_url: string;
  regulatory_snapshot: string;
  generated_at: string;
  conversion_cta: string;
  disclaimer: string;
}

const PRE_GO_LIVE_ARTICLES = new Set([
  "art-9", "art-10", "art-11", "art-13", "art-43", "art-50",
]);
const ON_INCIDENT_ARTICLES = new Set([
  "art-15", "art-72", "art-79",
]);

export async function handleClassifyAgentTool(
  registry: AcfRegistry,
  rawInput: unknown,
): Promise<ClassifyAgentOutput> {
  const input = ClassifyAgentInputSchema.parse(rawInput);

  /* Load rules */
  const [
    autonomyRules,
    criticalityRules,
    annexIII,
    annexI,
    gpai,
    aiActRoles,
    gdprRules,
    signOffMatrix,
    controlsMapping,
    rulesMeta,
  ] = await Promise.all([
    registry.rules.loadAutonomyInference(),
    registry.rules.loadCriticalityMatrix(),
    registry.rules.loadAiActAnnexIII(),
    registry.rules.loadAiActAnnexI(),
    registry.rules.loadGpaiTriggers(),
    registry.rules.loadAiActRoles(),
    registry.rules.loadGdprQualification(),
    registry.rules.loadSignOffMatrix(),
    registry.rules.loadDdaoControlsMapping(),
    registry.rules.loadRulesMeta(),
  ]);

  /* Extractors */
  const flags = extractFlags(input);
  const enums = extractEnumHints(input);
  const triggerInput = { text: input.description, enums, flags };

  /* Autonomy + criticality */
  const autonomy = inferAutonomy(autonomyRules, input);
  const criticality = inferCriticality(criticalityRules, input);

  /* AI Act obligations */
  const obligationsOut = inferAiActObligations(
    { annexIII, annexI, gpai },
    triggerInput,
  );

  /* AI Act role + GDPR */
  const aiActRole = inferAiActRole(aiActRoles, triggerInput);
  const gdprRole = inferGdprRole(gdprRules, triggerInput);

  /* Sign-off + controls */
  const signOff = inferSignOff(signOffMatrix, {
    criticality: criticality.score,
    personal_data_level: input.personal_data_level,
    financial_exposure: input.financial_exposure,
  });
  const controls = inferDdaoControls(controlsMapping, {
    level: autonomy.level,
    risk: criticality.score,
  });

  /* Confidence + assumptions */
  const enumProvided =
    (input.ai_act_triggers?.length ?? 0) > 0 ||
    (input.processing_purposes?.length ?? 0) > 0;
  const contextFieldsProvided =
    (input.sector ? 1 : 0) + (input.jurisdiction?.length ? 1 : 0) +
    (input.gpai_used !== undefined ? 1 : 0) + 1; /* usage_audience always there */

  const contradictions = computeContradictions(input, obligationsOut);
  const confidence = aggregateConfidence({
    ruleBaseConfidence: averageConfidence(obligationsOut.firedCategories.map((c) => c.confidence_base)),
    enumProvided,
    contextFieldsProvided,
    contradictions,
  });

  const assumptions: string[] = [];
  const gaps: string[] = [];
  if (!input.sector) {
    assumptions.push("sector not provided; the criticality calibration uses the neutral default.");
    gaps.push("confirm sector — banking/health/critical-infra modifiers may shift criticality.");
  }
  if (!input.jurisdiction || input.jurisdiction.length === 0) {
    assumptions.push("jurisdiction not provided; AI Act + GDPR reasoning assumes EU.");
    gaps.push("confirm jurisdiction(s) — non-EU jurisdictions may require entirely different qualifications.");
  }
  if (!enumProvided) {
    assumptions.push("ai_act_triggers and processing_purposes inferred from description (free-text matching).");
    gaps.push("validate inferred AI Act triggers with a human reviewer before relying on the qualification.");
  }

  /* Fiches */
  const fiches = collectFiches(autonomy.level, criticality.score, obligationsOut.firedCategories);

  /* Footer */
  const footer = buildDoctrineFooter({
    frameworkVersion: registry.meta.framework_version,
    rulesVersion: rulesMeta.rules_version,
    contentHash: registry.meta.content_hash,
    archiveUrl: registry.meta.permanent_archive_url,
  });

  /* Rationale per rule — combine obligations + role + sign-off + controls */
  const rationale = [
    ...obligationsOut.rationale_per_rule,
    {
      rule_id: aiActRole.rule_id,
      rule_version: rulesMeta.rules_version,
      fired: aiActRole.role !== "not_applicable",
      evidence: aiActRole.evidence.join("; "),
    },
    {
      rule_id: gdprRole.rule_id,
      rule_version: rulesMeta.rules_version,
      fired: gdprRole.role !== "not_applicable",
      evidence: gdprRole.evidence.join("; "),
    },
    {
      rule_id: signOff.rule_id,
      rule_version: rulesMeta.rules_version,
      fired: true,
      evidence: `criticality=${criticality.score}, pii=${input.personal_data_level}, fin=${input.financial_exposure}`,
    },
    {
      rule_id: controls.rule_id,
      rule_version: rulesMeta.rules_version,
      fired: controls.recommended_controls.length > 0,
      evidence: `level=${autonomy.level}, risk=${criticality.score}`,
    },
    {
      rule_id: autonomy.rule_id,
      rule_version: rulesMeta.rules_version,
      fired: true,
      evidence: `human_approval=${input.human_approval_required}, ext=${input.external_actions}`,
    },
    {
      rule_id: criticality.rule_id,
      rule_version: rulesMeta.rules_version,
      fired: true,
      evidence: `pii=${input.personal_data_level}, fin=${input.financial_exposure}`,
    },
  ];

  return {
    acf_level: { level: autonomy.level, rationale: autonomy.rationale },
    criticality: {
      score: criticality.score,
      rationale: criticality.rationale,
      matrix_ref: criticality.matrix_ref,
    },
    regulatory_qualifications: {
      likely_ai_act_role: aiActRole.role,
      likely_gdpr_status: gdprRole.role,
    },
    regulatory_qualifications_confidence: {
      likely_ai_act_role: aiActRole.confidence,
      likely_gdpr_status: gdprRole.confidence,
    },
    ai_act_obligations: groupObligationsByPhase(obligationsOut, gpai.obligations),
    applicable_fiches: fiches,
    recommended_controls: controls.recommended_controls.map((c) => c.title),
    ddao_controls: controls.ddao_controls.map((c) => `${c.control_id} (${c.control_type}, ${c.fiche_reference}): ${c.implementation_note}`),
    ddao_escalation: {
      required: criticality.score === "high" || criticality.score === "critical",
      trigger_thresholds: deriveEscalationThresholds(autonomy.level, criticality.score),
    },
    sign_off_required: signOff.required,
    confidence,
    assumptions,
    gaps_to_validate: gaps,
    requires_human_review: true,
    rationale_per_rule: rationale,
    ...footer,
    conversion_cta: CLASSIFY_AGENT_CONVERSION_CTA,
    disclaimer: ACF_REASON_DISCLAIMER,
  };
}

/* -------------------- helpers -------------------- */

function averageConfidence(
  confs: ("low" | "medium" | "high")[],
): "low" | "medium" | "high" {
  if (confs.length === 0) return "medium";
  const score = confs.reduce((acc, c) => acc + (c === "low" ? 0 : c === "medium" ? 1 : 2), 0) / confs.length;
  return score < 0.66 ? "low" : score < 1.34 ? "medium" : "high";
}

function computeContradictions(
  input: z.infer<typeof ClassifyAgentInputSchema>,
  obligations: ReturnType<typeof inferAiActObligations>,
): number {
  let n = 0;
  if (
    (input.ai_act_triggers?.includes("none") ?? false) &&
    obligations.firedCategories.length > 0
  ) {
    n += 1;
  }
  return n;
}

function groupObligationsByPhase(
  obligationsOut: ReturnType<typeof inferAiActObligations>,
  gpaiAll: { article: string; requirement: string; applicable_date: string; systemic_risk_only?: boolean }[],
): ClassifyAgentOutput["ai_act_obligations"] {
  const pre: ClassifyAgentOutput["ai_act_obligations"]["pre_go_live"] = [];
  const continuous: ClassifyAgentOutput["ai_act_obligations"]["continuous"] = [];
  const incident: ClassifyAgentOutput["ai_act_obligations"]["on_incident"] = [];

  const flatObligations = new Set<string>();
  for (const cat of obligationsOut.firedCategories) {
    for (const o of cat.obligations) flatObligations.add(o);
  }

  for (const article of flatObligations) {
    const item = {
      article,
      requirement: ARTICLE_REQUIREMENT_BY_ID[article] ?? `See AI Act ${article}`,
      applicable_date: "2027-12-02",
    };
    if (PRE_GO_LIVE_ARTICLES.has(article)) pre.push(item);
    else if (ON_INCIDENT_ARTICLES.has(article)) incident.push(item);
    else continuous.push(item);
  }

  for (const o of obligationsOut.gpaiObligations) {
    if (PRE_GO_LIVE_ARTICLES.has(o.article)) pre.push(o);
    else continuous.push(o);
  }

  return { pre_go_live: pre, continuous, on_incident: incident };
}

const ARTICLE_REQUIREMENT_BY_ID: Record<string, string> = {
  "art-5": "Prohibited practices screening.",
  "art-9": "Establish, implement and document a risk management system.",
  "art-10": "Data governance, training/validation/testing data sets quality.",
  "art-11": "Technical documentation.",
  "art-12": "Record-keeping / automated logging.",
  "art-13": "Transparency and provision of information to deployers / users.",
  "art-14": "Effective human oversight design and operation.",
  "art-15": "Accuracy, robustness, cybersecurity.",
  "art-26": "Deployer obligations: instructions, monitoring, fundamental rights impact assessment.",
  "art-27": "Fundamental rights impact assessment for high-risk AI deployers.",
  "art-43": "Conformity assessment for Annex I product-safety scope.",
  "art-50": "Transparency notice when interacting with AI / GPAI.",
  "art-72": "Post-market monitoring system.",
  "art-79": "Serious incident reporting to authorities.",
  "art-86": "Right to explanation of individual decision-making.",
};

function deriveEscalationThresholds(
  level: "N0" | "N1" | "N2" | "N3",
  risk: "low" | "medium" | "high" | "critical",
): string[] {
  const out: string[] = [];
  if (level === "N0" || level === "N1") {
    out.push("Any rejection of human-validated action escalates to DDAO.");
  }
  if (level === "N2") {
    out.push("Action above bounded perimeter escalates to DDAO before execution.");
    out.push("Drift > 10% on key metric vs baseline escalates within 24h.");
  }
  if (level === "N3") {
    out.push("Any out-of-perimeter action escalates immediately (block + human review).");
    out.push("Drift > 5% on any key metric triggers a kill-switch evaluation.");
    out.push("3 consecutive incidents within 24h auto-suspends the agent.");
  }
  if (risk === "critical") {
    out.push("Any incident with regulatory exposure escalates to board + legal within 4h.");
  }
  return out;
}

function collectFiches(
  level: "N0" | "N1" | "N2" | "N3",
  risk: "low" | "medium" | "high" | "critical",
  firedCategories: { fiches: string[] }[],
): { code: string; why: string }[] {
  const fiches = new Map<string, string>();
  // Level-derived
  if (level === "N2" || level === "N3") {
    fiches.set("ACF-12", "Formal mandate required for N2+ autonomy.");
    fiches.set("ACF-07", "Kill switch required for N2+ autonomy.");
    fiches.set("ACF-05", "Decision register required for N2+ autonomy.");
  }
  if (level === "N3") {
    fiches.set("ACF-14", "Monthly human-takeover drill required for N3.");
    fiches.set("ACF-08", "Real-time observability required for N3.");
  }
  // Risk-derived
  if (risk === "high" || risk === "critical") {
    fiches.set("ACF-02", "Criticality matrix grounds the high-risk scoring.");
    fiches.set("ACF-09", "Escalation thresholds required for high+criticality.");
    fiches.set("ACF-11", "Risk assessment required for high+criticality.");
  }
  // Regulation-derived
  for (const cat of firedCategories) {
    for (const f of cat.fiches) {
      if (!fiches.has(f)) fiches.set(f, "Mobilised by an AI Act category that fired on the agent description.");
    }
  }
  return [...fiches.entries()].map(([code, why]) => ({ code, why }));
}
