import { z } from "zod";

/* -------------------- Generic primitives -------------------- */

export const ConfidenceSchema = z.enum(["low", "medium", "high"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const CriticalitySchema = z.enum(["low", "medium", "high", "critical"]);
export type Criticality = z.infer<typeof CriticalitySchema>;

export const AcfLevelSchema = z.enum(["N0", "N1", "N2", "N3"]);
export type AcfLevel = z.infer<typeof AcfLevelSchema>;

export const AiActRoleSchema = z.enum([
  "provider", "deployer", "importer", "distributor", "not_applicable",
]);
export const GdprRoleSchema = z.enum([
  "controller", "processor", "joint_controller", "not_applicable",
]);

export const TriggerSchema = z.object({
  structured_flags: z.array(z.string()).optional(),
  keyword_patterns: z.array(z.string()).optional(),
  negation_aware: z.boolean().default(true),
  enum_match: z.record(z.string(), z.array(z.string())).optional(),
});
export type Trigger = z.infer<typeof TriggerSchema>;

/* -------------------- Common metadata header -------------------- */

const versionedHeader = {
  version: z.string(),
  last_update: z.string(),
};

export const RulesMetaSchema = z.object({
  rules_version: z.string(),
  last_update: z.string(),
  applicable_jurisdictions: z.array(z.string()),
});

/* -------------------- AI Act Annex III -------------------- */

export const RuleCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  triggers: TriggerSchema,
  obligations: z.array(z.string()),
  fiches: z.array(z.string()),
  confidence_base: ConfidenceSchema,
  requires_human_review: z.literal(true),
});

export const AiActAnnexIIISchema = z.object({
  ...versionedHeader,
  applicable_dates: z.array(
    z.object({
      category: z.string(),
      applicable_from: z.string(),
      deferred: z.boolean(),
    }),
  ),
  categories: z.array(RuleCategorySchema),
});

export const AiActAnnexISchema = z.object({
  ...versionedHeader,
  applicable_dates: z.array(
    z.object({
      category: z.string(),
      applicable_from: z.string(),
      deferred: z.boolean(),
    }),
  ),
  categories: z.array(RuleCategorySchema),
});

/* -------------------- GPAI -------------------- */

export const GpaiTriggersSchema = z.object({
  ...versionedHeader,
  triggers: TriggerSchema,
  obligations: z.array(
    z.object({
      article: z.string(),
      requirement: z.string(),
      applicable_date: z.string(),
      systemic_risk_only: z.boolean().optional(),
    }),
  ),
});

/* -------------------- Criticality matrix -------------------- */

export const CriticalityMatrixSchema = z.object({
  ...versionedHeader,
  cells: z.array(
    z.object({
      personal_data_level: z.enum(["none", "standard", "sensitive_special"]),
      financial_exposure: z.enum([
        "none", "low_operation", "medium_contract", "high_corporate",
      ]),
      sector_modifier: z.number(),
      score: CriticalitySchema,
      rationale_template: z.string(),
    }),
  ),
});

/* -------------------- Autonomy inference -------------------- */

export const AutonomyInferenceSchema = z.object({
  ...versionedHeader,
  thresholds: z.array(
    z.object({
      level: AcfLevelSchema,
      conditions: z.record(z.string(), z.array(z.string())),
      rationale_template: z.string(),
    }),
  ),
});

/* -------------------- DDAO controls mapping -------------------- */

export const DdaoControlsMappingSchema = z.object({
  ...versionedHeader,
  mappings: z.array(
    z.object({
      level: AcfLevelSchema,
      risk: CriticalitySchema,
      recommended_controls: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          owner_role: z.enum([
            "ddao", "dpo", "ciso", "business_owner", "auditor",
          ]),
          frequency: z.enum([
            "one_time", "monthly", "quarterly", "annual", "on_event",
          ]),
          evidence_artifact: z.string(),
        }),
      ),
      ddao_controls: z.array(
        z.object({
          control_id: z.string(),
          control_type: z.enum([
            "preventive", "detective", "corrective", "governance",
          ]),
          fiche_reference: z.string(),
          implementation_note: z.string(),
        }),
      ),
    }),
  ),
});

/* -------------------- Sign-off matrix -------------------- */

export const SignOffMatrixSchema = z.object({
  ...versionedHeader,
  rules: z.array(
    z.object({
      criticality: CriticalitySchema,
      personal_data_level: z.enum(["none", "standard", "sensitive_special"]),
      financial_exposure: z.enum([
        "none", "low_operation", "medium_contract", "high_corporate",
      ]),
      required: z.object({
        security: z.boolean(),
        privacy: z.boolean(),
        compliance: z.boolean(),
        legal: z.boolean(),
        business_sponsor: z.boolean(),
        board: z.boolean(),
      }),
    }),
  ),
});

/* -------------------- GDPR qualification -------------------- */

export const GdprQualificationSchema = z.object({
  ...versionedHeader,
  cases: z.array(
    z.object({
      id: z.string(),
      triggers: TriggerSchema,
      role: GdprRoleSchema,
      confidence_base: ConfidenceSchema,
      rationale_template: z.string(),
    }),
  ),
});

/* -------------------- AI Act roles -------------------- */

export const AiActRolesSchema = z.object({
  ...versionedHeader,
  rules: z.array(
    z.object({
      id: z.string(),
      triggers: TriggerSchema,
      role: AiActRoleSchema,
      confidence_base: ConfidenceSchema,
      rationale_template: z.string(),
    }),
  ),
});
