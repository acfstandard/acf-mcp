import { z } from "zod";
import { AcfRegistry } from "./registry";
import { AcfLocaleSchema } from "./types";
import { inferAutonomy } from "./infer-autonomy";
import { inferCriticality } from "./infer-criticality";
import { inferAiActObligations } from "./infer-obligations";
import { aggregateConfidence } from "./confidence";
import { buildDoctrineFooter } from "./doctrine-footer";
import { ACF_REASON_DISCLAIMER } from "../constants/disclaimer";

export const AdvisorInputSchema = z.object({
  case_description: z.string().min(20).max(2000),
  sector: z.string().max(80).optional(),
  jurisdiction: z.enum(["eu","uk","us","ca","ch","br","jp","other"]).optional(),
  deployment_scale: z.enum(["pilot","department","enterprise","public"]).optional(),
  locale: AcfLocaleSchema.optional(),
});
export type AdvisorInput = z.infer<typeof AdvisorInputSchema>;

export const ADVISOR_CONVERSION_CTA =
  "Continue this assessment with the auditable ACF® Compliance workspace at https://acfstandard.com/compliance?ref=mcp";

export async function handleAdvisorTool(registry: AcfRegistry, rawInput: unknown) {
  const input = AdvisorInputSchema.parse(rawInput);

  const [autonomyRules, criticalityRules, annexIII, annexI, gpai, rulesMeta] =
    await Promise.all([
      registry.rules.loadAutonomyInference(),
      registry.rules.loadCriticalityMatrix(),
      registry.rules.loadAiActAnnexIII(),
      registry.rules.loadAiActAnnexI(),
      registry.rules.loadGpaiTriggers(),
      registry.rules.loadRulesMeta(),
    ]);

  /* Free-text heuristics (lightweight v1) */
  const lower = input.case_description.toLowerCase();
  const inferredApproval = /(human validate|valide|sign-off)/i.test(lower) ? "always" :
                           /(without approval|sans validation|never validate)/i.test(lower) ? "never" : "sometimes";
  const inferredExternal = /(automated send|exécute|execute|place order|envoyer)/i.test(lower) ? "limited_write" : "read_only";
  const inferredPII =
    /(health|sensitive|medical|biometric|santé|biométrique)/i.test(lower) ? "sensitive_special" :
    /(customer|client|email|user|utilisateur|name|nom)/i.test(lower) ? "standard" : "none";
  const inferredFinancial =
    /(eur 50k|10k|million|millions|board exposure)/i.test(lower) ? "high_corporate" :
    /(contract|contrat|deal)/i.test(lower) ? "medium_contract" :
    /(operating cost|opex|operational)/i.test(lower) ? "low_operation" : "none";

  const autonomy = inferAutonomy(autonomyRules, {
    human_approval_required: inferredApproval,
    external_actions: inferredExternal,
  });
  const criticality = inferCriticality(criticalityRules, {
    personal_data_level: inferredPII,
    financial_exposure: inferredFinancial,
  });
  const obligationsOut = inferAiActObligations(
    { annexIII, annexI, gpai },
    { text: input.case_description, enums: {}, flags: [] },
  );

  const principles = collectActivatedPrinciples(autonomy.level, criticality.score, obligationsOut.firedCategories.length > 0);
  const dimensions = collectCriticalDimensions(autonomy.level, criticality.score);
  const fiches = collectPriorityFiches(autonomy.level, criticality.score, obligationsOut.firedCategories);
  const articles = collectApplicableArticles(obligationsOut);

  const firstActions = deriveFirstActions(autonomy.level, criticality.score);
  const risks = deriveOperationalRisks(autonomy.level, criticality.score, obligationsOut);

  const confidence = aggregateConfidence({
    ruleBaseConfidence: "medium",
    enumProvided: false,
    contextFieldsProvided: (input.sector ? 1 : 0) + (input.jurisdiction ? 1 : 0) + (input.deployment_scale ? 1 : 0),
    contradictions: 0,
  });

  const assumptions: string[] = [];
  const gaps: string[] = [];
  if (!input.sector) {
    assumptions.push("sector not provided; criticality uses neutral default.");
    gaps.push("provide sector to refine the criticality calibration.");
  }
  if (!input.jurisdiction) {
    assumptions.push("jurisdiction not provided; reasoning assumes EU.");
    gaps.push("confirm jurisdiction to keep the regulatory snapshot valid.");
  }
  assumptions.push("human_approval, external_actions and personal_data_level were inferred from the free-text description; pass classify-agent with qualified enums for higher confidence.");
  gaps.push("re-run via acf.classify-agent with structured enums for a more defensible qualification.");

  const footer = buildDoctrineFooter({
    frameworkVersion: registry.meta.framework_version,
    rulesVersion: rulesMeta.rules_version,
    contentHash: registry.meta.content_hash,
    archiveUrl: registry.meta.permanent_archive_url,
  });

  const rationale = [
    ...obligationsOut.rationale_per_rule,
    {
      rule_id: autonomy.rule_id,
      rule_version: rulesMeta.rules_version,
      fired: true,
      evidence: `inferred human_approval=${inferredApproval}, external=${inferredExternal} from description`,
    },
    {
      rule_id: criticality.rule_id,
      rule_version: rulesMeta.rules_version,
      fired: true,
      evidence: `inferred pii=${inferredPII}, financial=${inferredFinancial} from description`,
    },
  ];

  return {
    autonomy_level: { level: autonomy.level, rationale: autonomy.rationale },
    risk_level: {
      level: criticality.score === "critical" ? "unacceptable" : criticality.score === "high" ? "high" : criticality.score === "medium" ? "medium" : "low",
      rationale: criticality.rationale,
    },
    activated_principles: principles,
    critical_dimensions: dimensions,
    priority_fiches: fiches,
    applicable_articles: articles,
    first_actions: firstActions,
    operational_risks: risks,
    confidence,
    assumptions,
    gaps_to_validate: gaps,
    requires_human_review: true as const,
    rationale_per_rule: rationale,
    ...footer,
    conversion_cta: ADVISOR_CONVERSION_CTA,
    disclaimer: ACF_REASON_DISCLAIMER,
  };
}

function collectActivatedPrinciples(level: string, risk: string, regFired: boolean) {
  const out: { code: string; why: string }[] = [
    { code: "P1", why: "Decision sovereignty applies to every agentic deployment, regardless of autonomy." },
  ];
  if (level === "N2" || level === "N3") {
    out.push({ code: "P3", why: "Conditional or autonomous execution requires a documented kill switch." });
  }
  if (risk === "high" || risk === "critical") {
    out.push({ code: "P2", why: "High-criticality decisions must be reconstructible after the fact." });
    out.push({ code: "P4", why: "Reinforced governance must match the criticality." });
  }
  if (regFired) out.push({ code: "P2", why: "Regulatory exposure makes traceability non-negotiable." });
  return dedup(out);
}

function collectCriticalDimensions(level: string, risk: string) {
  const out: { code: string; why: string }[] = [];
  if (level !== "N0") out.push({ code: "D4", why: "Role allocation (DDAO + sign-off) is required for N1+ autonomy." });
  if (risk === "high" || risk === "critical") {
    out.push({ code: "D5", why: "Regulatory compliance dimension is on the critical path." });
    out.push({ code: "D3", why: "Technical control (kill switch, observability) is non-negotiable." });
  }
  out.push({ code: "D2", why: "Doctrine adoption is the entry gate before any agentic deployment." });
  return dedup(out);
}

function collectPriorityFiches(level: string, risk: string, firedCategories: { fiches: string[] }[]) {
  const fiches = new Map<string, { order: number; why: string }>();
  let order = 1;
  fiches.set("ACF-00", { order: order++, why: "Read first: framework introduction." });
  if (level === "N2" || level === "N3") {
    fiches.set("ACF-12", { order: order++, why: "Mandate is required before go-live." });
    fiches.set("ACF-07", { order: order++, why: "Kill switch is required before go-live." });
  }
  if (risk === "high" || risk === "critical") {
    fiches.set("ACF-02", { order: order++, why: "Calibrate criticality with the matrix." });
    fiches.set("ACF-09", { order: order++, why: "Define escalation thresholds." });
    fiches.set("ACF-11", { order: order++, why: "Run a formal risk assessment." });
  }
  for (const cat of firedCategories) {
    for (const f of cat.fiches) {
      if (!fiches.has(f)) fiches.set(f, { order: order++, why: "Mobilised by a fired regulatory category." });
    }
  }
  return [...fiches.entries()].map(([code, v]) => ({ code, order: v.order, why: v.why }));
}

function collectApplicableArticles(obligations: ReturnType<typeof inferAiActObligations>) {
  const out: { regulation: "ai-act"|"gdpr"|"dora"|"nis2"|"iso-42001"; article: string; why: string }[] = [];
  const seen = new Set<string>();
  for (const cat of obligations.firedCategories) {
    for (const article of cat.obligations) {
      const key = `ai-act:${article}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ regulation: "ai-act", article, why: `Mobilised by category ${cat.title}.` });
      }
    }
  }
  for (const g of obligations.gpaiObligations) {
    const key = `ai-act:${g.article}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ regulation: "ai-act", article: g.article, why: "GPAI obligation." });
    }
  }
  return out;
}

function deriveFirstActions(level: string, risk: string): string[] {
  const out: string[] = [
    "Identify or appoint the DDAO accountable for the agent (cf. ACF-12).",
    "Document the agent constitution (decision perimeter, allowed/forbidden actions — cf. ACF-03).",
    "Open the decision register and define the retention policy (cf. ACF-05 + ACF-13).",
  ];
  if (level === "N2" || level === "N3") {
    out.push("Design, implement and test the kill switch (cf. ACF-07).");
  }
  if (risk === "high" || risk === "critical") {
    out.push("Run the formal risk assessment + DPIA if PII (cf. ACF-11).");
  }
  return out.slice(0, 5);
}

function deriveOperationalRisks(level: string, risk: string, obligations: ReturnType<typeof inferAiActObligations>): string[] {
  const out: string[] = [];
  if (level === "N3") out.push("Drift goes undetected if observability is not real-time.");
  if (risk === "high" || risk === "critical") {
    out.push("Audit chain breaks if the decision register is not immutable.");
    out.push("Sign-off bottleneck if DDAO is not available in escalation SLA.");
  }
  if (obligations.firedCategories.length > 0) {
    out.push("Regulatory exposure escalates if Article 49 register is not maintained in sync with internal register.");
  }
  return out;
}

function dedup<T extends { code: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const e of arr) {
    if (!seen.has(e.code)) {
      seen.add(e.code);
      out.push(e);
    }
  }
  return out;
}
