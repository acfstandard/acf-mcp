import { z } from "zod";
import { AcfRegistry } from "./registry";
import { AcfLocaleSchema } from "./types";
import { aggregateConfidence } from "./confidence";
import { buildDoctrineFooter } from "./doctrine-footer";
import { ACF_REASON_DISCLAIMER } from "../constants/disclaimer";

export const AssessAutonomyInputSchema = z.object({
  agent_description: z.string().min(10).max(1500),
  intended_actions: z.array(z.string()).min(1).max(20),
  reversibility: z.enum(["fully", "partially", "irreversible"]),
  audit_requirements: z.enum(["none", "internal", "regulatory", "forensic"]),
  human_in_loop_cost: z.enum(["low", "medium", "high"]).optional(),
  locale: AcfLocaleSchema.optional(),
});
export type AssessAutonomyInput = z.infer<typeof AssessAutonomyInputSchema>;

export async function handleAssessAutonomyTool(
  registry: AcfRegistry,
  rawInput: unknown,
) {
  const input = AssessAutonomyInputSchema.parse(rawInput);
  const rulesMeta = await registry.rules.loadRulesMeta();

  /* Decision tree (simple deterministic baseline). */
  let level: "N0" | "N1" | "N2" | "N3" = "N1";
  let rationale = "Default baseline for AI agents with bounded responsibility.";

  if (input.audit_requirements === "regulatory" || input.audit_requirements === "forensic") {
    level = "N1";
    rationale =
      "Regulatory-audit obligations push the recommended baseline to N1 (supervised) at a minimum. Consider N0 if traceability is uncertain.";
  }

  if (input.reversibility === "irreversible" && (input.audit_requirements === "regulatory" || input.audit_requirements === "forensic")) {
    level = "N2";
    rationale =
      "Irreversible actions combined with regulatory-audit obligations require at minimum N2 (bounded autonomy) with strong human oversight checkpoints.";
  }

  if (input.audit_requirements === "internal" && input.reversibility === "fully") {
    if (input.intended_actions.every((a) => /search|summari|propose|suggest/i.test(a))) {
      level = "N0";
      rationale = "All intended actions are reversible suggestions or read-only; N0 (assistance) is the right baseline.";
    }
  }

  if (input.reversibility === "partially" && input.audit_requirements === "internal") {
    level = "N2";
    rationale = "Partial reversibility with internal audit allows bounded N2 execution within a documented mandate.";
  }

  if (input.reversibility !== "irreversible" && input.audit_requirements === "none" && input.human_in_loop_cost === "high") {
    level = "N3";
    rationale = "High human-in-loop cost and reversible actions allow N3 autonomy with strong observability + kill switch.";
  }

  const go_no_go = [
    { criterion: "Mandate signed by the named DDAO", status: level === "N0" ? "pass" : "conditional" as const },
    { criterion: "Kill switch documented and tested", status: level === "N0" ? "pass" : "fail" as const },
    { criterion: "Decision register format defined", status: level === "N0" ? "pass" : "conditional" as const },
    { criterion: "Escalation thresholds named in numeric terms", status: level === "N0" ? "pass" : "fail" as const },
    { criterion: "Sign-off from DPO if PII transits the agent", status: "conditional" as const },
  ];

  const gating_thresholds = [
    { condition: "Any action above bounded perimeter", escalation: "Block + DDAO ack before execution" },
    { condition: "Drift > 10% on key metric vs baseline", escalation: "Auto-suspend within 24h + post-mortem" },
    { condition: "3 consecutive incidents in 24h", escalation: "Auto-suspend + immediate DDAO review" },
  ];
  if (level === "N3") {
    gating_thresholds.push({
      condition: "Any out-of-perimeter action",
      escalation: "Block + kill switch evaluation within 5 minutes",
    });
  }

  const kill_switch_design = {
    levels: ["freeze (instant)", "redirect (≤5 min)", "revoke (≤1 h)"],
    response_time_s: [5, 300, 3600],
  };

  const referenced_fiches = level === "N0" ? ["ACF-00", "ACF-05"] :
    level === "N1" ? ["ACF-05", "ACF-09", "ACF-12"] :
    level === "N2" ? ["ACF-07", "ACF-09", "ACF-12", "ACF-05"] :
    ["ACF-07", "ACF-08", "ACF-12", "ACF-14"];

  const footer = buildDoctrineFooter({
    frameworkVersion: registry.meta.framework_version,
    rulesVersion: rulesMeta.rules_version,
    contentHash: registry.meta.content_hash,
    archiveUrl: registry.meta.permanent_archive_url,
  });

  return {
    recommended_level: { level, rationale },
    go_no_go_criteria: go_no_go,
    gating_thresholds,
    kill_switch_design,
    referenced_fiches,
    confidence: aggregateConfidence({
      ruleBaseConfidence: "medium",
      enumProvided: true,
      contextFieldsProvided: input.human_in_loop_cost ? 1 : 0,
      contradictions: 0,
    }),
    assumptions: ["Inference is deterministic over the 4 supplied dimensions; sector calibration not included."],
    gaps_to_validate: [
      "Confirm whether any intended action handles PII (Article 35 GDPR DPIA may apply).",
      "Confirm whether the kill switch has been tested in the last quarter.",
    ],
    requires_human_review: true as const,
    rationale_per_rule: [
      {
        rule_id: "assess-autonomy.decision-tree",
        rule_version: rulesMeta.rules_version,
        fired: true,
        evidence: `reversibility=${input.reversibility}, audit=${input.audit_requirements}, hil_cost=${input.human_in_loop_cost ?? "n/a"}`,
      },
    ],
    ...footer,
    disclaimer: ACF_REASON_DISCLAIMER,
  };
}
