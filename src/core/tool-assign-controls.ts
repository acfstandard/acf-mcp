import { z } from "zod";
import { AcfRegistry } from "./registry";
import { AcfLocaleSchema } from "./types";
import { inferDdaoControls } from "./infer-controls";
import { aggregateConfidence } from "./confidence";
import { buildDoctrineFooter } from "./doctrine-footer";
import { ACF_REASON_DISCLAIMER } from "../constants/disclaimer";

export const AssignControlsInputSchema = z.object({
  agent_description: z.string().min(10).max(500),
  acf_level: z.enum(["N0", "N1", "N2", "N3"]),
  risk_level: z.enum(["low", "medium", "high", "critical"]),
  budget_constraint: z.enum(["minimal", "standard", "comprehensive"]).optional(),
  locale: AcfLocaleSchema.optional(),
});
export type AssignControlsInput = z.infer<typeof AssignControlsInputSchema>;

const EFFORT_DAYS_BY_FREQUENCY: Record<string, number> = {
  one_time: 5, monthly: 1, quarterly: 2, annual: 4, on_event: 1,
};

export async function handleAssignControlsTool(
  registry: AcfRegistry,
  rawInput: unknown,
) {
  const input = AssignControlsInputSchema.parse(rawInput);
  const [mapping, rulesMeta] = await Promise.all([
    registry.rules.loadDdaoControlsMapping(),
    registry.rules.loadRulesMeta(),
  ]);

  const controls = inferDdaoControls(mapping, {
    level: input.acf_level,
    risk: input.risk_level,
  });

  let recommended = controls.recommended_controls;
  if (input.budget_constraint === "minimal") recommended = recommended.slice(0, 2);
  if (input.budget_constraint === "comprehensive") recommended = [...controls.recommended_controls];

  const estimatedEffort = recommended.reduce(
    (acc, c) => acc + (EFFORT_DAYS_BY_FREQUENCY[c.frequency] ?? 1),
    0,
  );

  const footer = buildDoctrineFooter({
    frameworkVersion: registry.meta.framework_version,
    rulesVersion: rulesMeta.rules_version,
    contentHash: registry.meta.content_hash,
    archiveUrl: registry.meta.permanent_archive_url,
  });

  const summary = `Control set scoped to ACF® ${input.acf_level} / risk=${input.risk_level} (${recommended.length} recommended controls, ${controls.ddao_controls.length} ACF-canonical controls).`;

  return {
    recommended_controls: recommended,
    ddao_controls: controls.ddao_controls,
    total_count: recommended.length + controls.ddao_controls.length,
    estimated_total_effort_days: estimatedEffort,
    ddao_summary: summary,
    confidence: aggregateConfidence({
      ruleBaseConfidence: "medium",
      enumProvided: true,
      contextFieldsProvided: input.budget_constraint ? 1 : 0,
      contradictions: 0,
    }),
    assumptions: [
      "Controls are derived from the canonical level × risk mapping; sector-specific overrides not applied in V1.0.",
    ],
    gaps_to_validate: [
      "Confirm DDAO availability for the proposed escalation cadence.",
      "Confirm evidence-storage location for each control before go-live.",
    ],
    requires_human_review: true as const,
    rationale_per_rule: [
      {
        rule_id: controls.rule_id,
        rule_version: rulesMeta.rules_version,
        fired: true,
        evidence: `level=${input.acf_level}, risk=${input.risk_level}`,
      },
    ],
    ...footer,
    disclaimer: ACF_REASON_DISCLAIMER,
  };
}
