import { z } from "zod";
import { AcfRegistry } from "./registry";
import { AcfLocaleSchema } from "./types";
import { aggregateConfidence } from "./confidence";
import { buildDoctrineFooter } from "./doctrine-footer";
import { ACF_REASON_DISCLAIMER } from "../constants/disclaimer";

export const IdentifyGapsInputSchema = z.object({
  current_inventory: z.object({
    ai_systems_count: z.number().int().min(0),
    high_risk_count: z.number().int().min(0).optional(),
    gpai_used: z.boolean().optional(),
    shadow_ai_known: z.boolean().optional(),
  }),
  current_processes: z.array(
    z.object({
      process: z.string(),
      exists: z.boolean(),
      documented: z.boolean().optional(),
    }),
  ),
  sector: z.string().max(80).optional(),
  locale: AcfLocaleSchema.optional(),
});
export type IdentifyGapsInput = z.infer<typeof IdentifyGapsInputSchema>;

const REQUIRED_PROCESSES_BY_DIM: Record<string, string[]> = {
  D1: ["ai_committee", "executive_sponsor"],
  D2: ["ai_inventory", "doctrine_published"],
  D3: ["kill_switch_drill", "observability"],
  D4: ["ddao_appointed", "raci"],
  D5: ["dpia", "article_49_register", "ai_act_qualification"],
  D6: ["annual_audit", "incident_review"],
};

export async function handleIdentifyGapsTool(
  registry: AcfRegistry,
  rawInput: unknown,
) {
  const input = IdentifyGapsInputSchema.parse(rawInput);
  const rulesMeta = await registry.rules.loadRulesMeta();
  const processMap = new Map<string, { exists: boolean; documented?: boolean }>();
  for (const p of input.current_processes) processMap.set(p.process, p);

  const dims: Record<string, number> = {};
  const gaps: {
    dimension: string; severity: "low" | "medium" | "high" | "critical";
    description: string; remediation: string; fiches: string[];
    estimated_effort_days?: number;
  }[] = [];

  for (const [dim, required] of Object.entries(REQUIRED_PROCESSES_BY_DIM)) {
    let score = 100;
    for (const proc of required) {
      const found = processMap.get(proc);
      if (found && !found.exists) {
        // Explicitly declared as not existing
        score -= Math.floor(100 / required.length);
        const severity =
          dim === "D5" ? "critical" :
          dim === "D3" || dim === "D4" ? "high" :
          "medium" as const;
        gaps.push({
          dimension: dim,
          severity,
          description: `Process '${proc}' is missing for ${dim}.`,
          remediation: remediateProcess(proc),
          fiches: ficheFor(proc),
          estimated_effort_days: effortFor(proc),
        });
      } else if (!found) {
        // Not declared at all — treat as unknown (partial penalty)
        score -= Math.floor(50 / required.length);
      } else if (found.documented === false) {
        score -= Math.floor(50 / required.length);
        gaps.push({
          dimension: dim,
          severity: "medium",
          description: `Process '${proc}' exists but is undocumented.`,
          remediation: `Document '${proc}' with the relevant ACF® card.`,
          fiches: ficheFor(proc),
          estimated_effort_days: 2,
        });
      }
    }
    dims[dim] = Math.max(0, score);
  }

  // Inventory-driven gaps
  if (input.current_inventory.shadow_ai_known) {
    gaps.push({
      dimension: "D1",
      severity: "high",
      description: "Shadow AI exists in the organisation.",
      remediation: "Run a discovery campaign + classify each shadow agent via acf.classify-agent.",
      fiches: ["ACF-01"],
      estimated_effort_days: 10,
    });
  }
  if (
    input.current_inventory.high_risk_count !== undefined &&
    input.current_inventory.high_risk_count > 0 &&
    !processMap.get("dpia")?.exists
  ) {
    gaps.push({
      dimension: "D5",
      severity: "critical",
      description: "High-risk systems present but no DPIA process.",
      remediation: "Stand up the DPIA workflow before any new high-risk go-live.",
      fiches: ["ACF-11"],
      estimated_effort_days: 5,
    });
  }

  const overall = Math.round(
    Object.values(dims).reduce((acc, v) => acc + v, 0) / Object.keys(dims).length,
  );

  const order = ["critical", "high", "medium", "low"] as const;
  const priority = [...gaps]
    .sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))
    .map((g) => `${g.dimension}: ${g.description}`);

  const quickWins = gaps
    .filter((g) => (g.estimated_effort_days ?? 0) <= 3)
    .map((g) => g.description);

  const footer = buildDoctrineFooter({
    frameworkVersion: registry.meta.framework_version,
    rulesVersion: rulesMeta.rules_version,
    contentHash: registry.meta.content_hash,
    archiveUrl: registry.meta.permanent_archive_url,
  });

  return {
    maturity_score: { overall, by_dimension: dims },
    gaps,
    priority_order: priority,
    quick_wins: quickWins,
    confidence: aggregateConfidence({
      ruleBaseConfidence: "medium",
      enumProvided: false,
      contextFieldsProvided: input.sector ? 1 : 0,
      contradictions: 0,
    }),
    assumptions: ["Maturity baseline is unweighted across dimensions; sector-specific weights not yet calibrated."],
    gaps_to_validate: [
      "Confirm which gaps were inferred vs explicitly declared by your inventory.",
      "Run acf.classify-agent on the high-risk subset to consolidate the qualification.",
    ],
    requires_human_review: true as const,
    rationale_per_rule: [
      {
        rule_id: "identify-gaps.dimension-checklist",
        rule_version: rulesMeta.rules_version,
        fired: true,
        evidence: `${input.current_processes.length} processes evaluated`,
      },
    ],
    ...footer,
    disclaimer: ACF_REASON_DISCLAIMER,
  };
}

function remediateProcess(p: string): string {
  const map: Record<string, string> = {
    ai_committee: "Establish a recurring AI committee with executive sponsorship.",
    executive_sponsor: "Identify a sponsoring executive at COMEX level.",
    ai_inventory: "Stand up the AI inventory using the ACF-01 mapping template.",
    doctrine_published: "Publish a doctrine note grounded in ACF® v1.0 to the relevant teams.",
    kill_switch_drill: "Run a quarterly kill-switch drill per ACF-14.",
    observability: "Wire end-to-end observability on every N2+ agent.",
    ddao_appointed: "Appoint a DDAO per N2+ agent with documented mandate.",
    raci: "Publish a RACI for agentic decisions including DDAO + DPO + CISO + sponsor.",
    dpia: "Stand up the DPIA workflow with ACF-11 as the template.",
    article_49_register: "Prepare the Article 49 register for any high-risk system before go-live.",
    ai_act_qualification: "Run acf.classify-agent on each system to qualify under the AI Act.",
    annual_audit: "Schedule an annual internal audit of agents in production.",
    incident_review: "Open a quarterly incident review forum with the AI committee.",
  };
  return map[p] ?? `Document and implement ${p}.`;
}

function ficheFor(p: string): string[] {
  const map: Record<string, string[]> = {
    ai_inventory: ["ACF-01"],
    decision_register: ["ACF-05"],
    kill_switch_drill: ["ACF-07", "ACF-14"],
    ddao_appointed: ["ACF-12"],
    dpia: ["ACF-11"],
    article_49_register: ["ACF-05", "ACF-11"],
    observability: ["ACF-08"],
  };
  return map[p] ?? [];
}

function effortFor(p: string): number {
  const map: Record<string, number> = {
    ai_committee: 5,
    decision_register: 8,
    kill_switch_drill: 3,
    dpia: 10,
    ai_inventory: 8,
    observability: 15,
  };
  return map[p] ?? 5;
}
