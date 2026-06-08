import { z } from "zod";
import { AcfLocaleSchema } from "./types";

/* -------------------- Enums -------------------- */

export const HumanApprovalEnum = z.enum(["always", "sometimes", "never"]);
export const PersonalDataEnum = z.enum([
  "none", "standard", "sensitive_special",
]);
export const FinancialExposureEnum = z.enum([
  "none", "low_operation", "medium_contract", "high_corporate",
]);
export const ExternalActionsEnum = z.enum([
  "none", "read_only", "limited_write", "full_write",
]);
export const UsageAudienceEnum = z.enum([
  "internal", "third_party_b2b", "public_consumer",
]);
export const JurisdictionEnum = z.enum([
  "eu", "uk", "us", "ca", "ch", "br", "jp", "other",
]);

export const AiActTriggerEnum = z.enum([
  "biometric_identity",
  "critical_infrastructure",
  "educational_assessment",
  "employment_recruitment",
  "credit_scoring",
  "law_enforcement",
  "migration_asylum",
  "justice_democracy",
  "none",
]);

export const ProcessingPurposeEnum = z.enum([
  "hr", "marketing", "core_financial", "tech_support", "healthcare",
  "education", "public_service", "compliance_monitoring", "other",
]);

/* -------------------- Input schema (10 qualified fields + hints) -------------------- */

export const ClassifyAgentInputSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(20).max(1000),
  decisions_taken: z.array(z.string()).min(1).max(20),

  human_approval_required: HumanApprovalEnum,
  personal_data_level: PersonalDataEnum,
  financial_exposure: FinancialExposureEnum,
  external_actions: ExternalActionsEnum,

  gpai_used: z.boolean(),
  usage_audience: UsageAudienceEnum,
  sector: z.string().max(80).optional(),
  jurisdiction: z.array(JurisdictionEnum).optional(),

  ai_act_triggers: z.array(AiActTriggerEnum).optional(),
  processing_purposes: z.array(ProcessingPurposeEnum).optional(),

  locale: AcfLocaleSchema.optional(),
});
export type ClassifyAgentInput = z.infer<typeof ClassifyAgentInputSchema>;

/* -------------------- Extractors -------------------- */

export function extractFlags(input: ClassifyAgentInput): string[] {
  return [
    `human_approval_required:${input.human_approval_required}`,
    `personal_data_level:${input.personal_data_level}`,
    `financial_exposure:${input.financial_exposure}`,
    `external_actions:${input.external_actions}`,
    `usage_audience:${input.usage_audience}`,
    `gpai_used:${input.gpai_used}`,
  ];
}

export function extractEnumHints(
  input: ClassifyAgentInput,
): Record<string, string[]> {
  const hints: Record<string, string[]> = {};
  if (input.ai_act_triggers) hints["ai_act_triggers"] = input.ai_act_triggers;
  if (input.processing_purposes)
    hints["processing_purposes"] = input.processing_purposes;
  hints["usage_audience"] = [input.usage_audience];
  hints["personal_data_level"] = [input.personal_data_level];
  hints["gpai_used"] = [String(input.gpai_used)];
  return hints;
}
