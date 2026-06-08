import { z } from "zod";
import { AcfRegistry } from "./registry";
import { AcfLocaleSchema } from "./types";
import { inferAiActObligations } from "./infer-obligations";
import { aggregateConfidence } from "./confidence";
import { buildDoctrineFooter } from "./doctrine-footer";
import { ACF_REASON_DISCLAIMER } from "../constants/disclaimer";

export const MapObligationsInputSchema = z.object({
  annex: z.enum(["iii", "i", "none"]),
  use_case: z.string().min(10).max(500),
  provider_or_deployer: z.enum(["provider", "deployer", "both"]),
  gpai_used: z.boolean().optional(),
  locale: AcfLocaleSchema.optional(),
});
export type MapObligationsInput = z.infer<typeof MapObligationsInputSchema>;

const PRE_GO_LIVE = new Set(["art-9", "art-10", "art-11", "art-13", "art-43", "art-50"]);
const ON_INCIDENT = new Set(["art-15", "art-72", "art-79"]);

const ARTICLE_DETAIL: Record<string, { title: string; requirement: string; deadline: string; operational_actions: string[]; evidence_required: string[]; digital_omnibus_deferred: boolean }> = {
  "art-9": { title: "Risk management system", requirement: "Establish, implement, document, maintain a risk management system across the lifecycle.", deadline: "2027-12-02", operational_actions: ["Stand up risk register", "Define risk methodology", "Review quarterly"], evidence_required: ["Risk register", "Methodology doc"], digital_omnibus_deferred: true },
  "art-10": { title: "Data and data governance", requirement: "Training/validation/testing data sets governance + quality requirements.", deadline: "2027-12-02", operational_actions: ["Document data sources", "Run bias evaluation", "Document data drift monitoring"], evidence_required: ["Data inventory", "Bias evaluation report"], digital_omnibus_deferred: true },
  "art-11": { title: "Technical documentation", requirement: "Maintain technical documentation per Annex IV.", deadline: "2027-12-02", operational_actions: ["Author Annex IV-aligned tech doc"], evidence_required: ["Technical documentation"], digital_omnibus_deferred: true },
  "art-12": { title: "Record-keeping", requirement: "Automated logs over the lifecycle of the system.", deadline: "2027-12-02", operational_actions: ["Wire structured logging", "Define retention policy"], evidence_required: ["Logs"], digital_omnibus_deferred: true },
  "art-13": { title: "Transparency to deployers", requirement: "Provide instructions for use that allow the deployer to interpret outputs.", deadline: "2027-12-02", operational_actions: ["Draft instructions for use", "Translate to operating languages"], evidence_required: ["Instructions for use"], digital_omnibus_deferred: true },
  "art-14": { title: "Human oversight", requirement: "Effective human oversight design + operation.", deadline: "2027-12-02", operational_actions: ["Design kill switch (ACF-07)", "Document escalation thresholds (ACF-09)"], evidence_required: ["Kill switch design", "Drill reports"], digital_omnibus_deferred: true },
  "art-15": { title: "Accuracy, robustness, cybersecurity", requirement: "Maintain accuracy, robustness, cybersecurity levels appropriate to the use.", deadline: "continuous", operational_actions: ["Define accuracy KPIs", "Run robustness tests", "Define cybersecurity controls"], evidence_required: ["KPI dashboards", "Pen test reports"], digital_omnibus_deferred: false },
  "art-26": { title: "Deployer obligations", requirement: "Instructions, monitoring, fundamental rights impact assessment.", deadline: "2027-12-02", operational_actions: ["Run fundamental rights IA", "Document monitoring plan"], evidence_required: ["FRIA report", "Monitoring plan"], digital_omnibus_deferred: true },
  "art-27": { title: "Fundamental rights impact assessment", requirement: "Mandatory FRIA for high-risk deployers in some sectors.", deadline: "2027-12-02", operational_actions: ["Author FRIA"], evidence_required: ["FRIA"], digital_omnibus_deferred: true },
  "art-43": { title: "Conformity assessment", requirement: "Conformity assessment procedure for Annex I scope.", deadline: "2028-08-02", operational_actions: ["Run conformity assessment via notified body"], evidence_required: ["CE marking"], digital_omnibus_deferred: false },
  "art-50": { title: "Transparency on AI/GPAI", requirement: "Disclose AI usage to natural persons interacting with the system.", deadline: "2026-08-02", operational_actions: ["Add disclosure on every user surface"], evidence_required: ["Disclosure copy"], digital_omnibus_deferred: false },
  "art-72": { title: "Post-market monitoring", requirement: "Establish a post-market monitoring system.", deadline: "continuous", operational_actions: ["Define post-market monitoring plan"], evidence_required: ["Monitoring reports"], digital_omnibus_deferred: false },
  "art-79": { title: "Serious incident reporting", requirement: "Report serious incidents to authorities within 15 days.", deadline: "on-incident", operational_actions: ["Define incident classification + reporting playbook"], evidence_required: ["Incident reports"], digital_omnibus_deferred: false },
  "art-86": { title: "Right to explanation", requirement: "Affected persons can request an explanation of an individual decision.", deadline: "2027-12-02", operational_actions: ["Build explanation generation flow"], evidence_required: ["Explanation templates"], digital_omnibus_deferred: true },
};

export async function handleMapObligationsTool(
  registry: AcfRegistry,
  rawInput: unknown,
) {
  const input = MapObligationsInputSchema.parse(rawInput);
  const [annexIII, annexI, gpai, rulesMeta] = await Promise.all([
    registry.rules.loadAiActAnnexIII(),
    registry.rules.loadAiActAnnexI(),
    registry.rules.loadGpaiTriggers(),
    registry.rules.loadRulesMeta(),
  ]);

  const obligationsOut = inferAiActObligations(
    { annexIII, annexI, gpai },
    {
      text: input.use_case,
      enums: input.gpai_used ? { gpai_used: ["true"] } : {},
      flags: [],
    },
  );

  const articles = new Set<string>();
  for (const cat of obligationsOut.firedCategories) for (const a of cat.obligations) articles.add(a);

  // Always add deployer/provider duties
  if (input.provider_or_deployer === "deployer" || input.provider_or_deployer === "both") {
    articles.add("art-26");
    articles.add("art-27");
  }

  // Always add transparency (art-50) — mandatory for all AI interacting with natural persons
  articles.add("art-50");

  const pre: any[] = [];
  const continuous: any[] = [];
  const incident: any[] = [];

  const ficheFor = (a: string): string[] => {
    for (const cat of obligationsOut.firedCategories) {
      if (cat.obligations.includes(a)) return cat.fiches;
    }
    return [];
  };

  for (const a of articles) {
    const detail = ARTICLE_DETAIL[a];
    if (!detail) continue;
    const item = {
      article: a,
      title: detail.title,
      requirement: detail.requirement,
      deadline: detail.deadline,
      fiches: ficheFor(a),
      operational_actions: detail.operational_actions,
      evidence_required: detail.evidence_required,
      digital_omnibus_deferred: detail.digital_omnibus_deferred,
    };
    if (PRE_GO_LIVE.has(a)) pre.push(item);
    else if (ON_INCIDENT.has(a)) incident.push(item);
    else continuous.push(item);
  }

  for (const o of obligationsOut.gpaiObligations) {
    const item = {
      article: o.article,
      title: ARTICLE_DETAIL[o.article]?.title ?? "GPAI obligation",
      requirement: o.requirement,
      deadline: o.applicable_date,
      fiches: [],
      operational_actions: ARTICLE_DETAIL[o.article]?.operational_actions ?? [],
      evidence_required: ARTICLE_DETAIL[o.article]?.evidence_required ?? [],
      digital_omnibus_deferred: false,
    };
    if (PRE_GO_LIVE.has(o.article)) pre.push(item);
    else continuous.push(item);
  }

  const total_count = pre.length + continuous.length + incident.length;
  const critical_path = pre
    .filter((p) => p.digital_omnibus_deferred === false)
    .slice(0, 5)
    .map((p) => `${p.article}: ${p.title}`);

  const footer = buildDoctrineFooter({
    frameworkVersion: registry.meta.framework_version,
    rulesVersion: rulesMeta.rules_version,
    contentHash: registry.meta.content_hash,
    archiveUrl: registry.meta.permanent_archive_url,
  });

  return {
    obligations: { pre_go_live: pre, continuous, on_incident: incident },
    total_count,
    critical_path,
    confidence: aggregateConfidence({
      ruleBaseConfidence: "medium",
      enumProvided: input.annex === "iii" || input.annex === "i",
      contextFieldsProvided: input.gpai_used !== undefined ? 1 : 0,
      contradictions: input.annex === "none" && obligationsOut.firedCategories.length > 0 ? 1 : 0,
    }),
    assumptions: input.annex === "none" ? ["Caller declared no annex but at least one rule fired on the use case description; flagged below."] : [],
    gaps_to_validate: [
      "Confirm provider_or_deployer qualification — it changes the obligation set.",
      "Confirm GPAI usage — Article 50 transparency obligation depends on it.",
    ],
    requires_human_review: true as const,
    rationale_per_rule: obligationsOut.rationale_per_rule,
    ...footer,
    disclaimer: ACF_REASON_DISCLAIMER,
  };
}
