import { z } from "zod";
import { ConfidenceSchema } from "./rule-types";

export const RationalePerRuleSchema = z.object({
  rule_id: z.string(),
  rule_version: z.string(),
  fired: z.boolean(),
  evidence: z.string(),
});
export type RationalePerRule = z.infer<typeof RationalePerRuleSchema>;

/**
 * The canonical "footer" appended to every REASON tool output.
 * Snapshot tests in Phase 11 lock 4 fields:
 *   disclaimer, requires_human_review, doctrine_hash (non-empty),
 *   doctrine_version (non-empty).
 */
export const ReasonFooterSchema = z.object({
  confidence: ConfidenceSchema,
  assumptions: z.array(z.string()),
  gaps_to_validate: z.array(z.string()),
  requires_human_review: z.literal(true),
  rationale_per_rule: z.array(RationalePerRuleSchema),
  doctrine_version: z.string().min(1),
  doctrine_hash: z.string().min(1),
  doctrine_archive_url: z.string().url(),
  regulatory_snapshot: z.string(),
  generated_at: z.string().datetime(),
  disclaimer: z.string().min(100),
});
export type ReasonFooter = z.infer<typeof ReasonFooterSchema>;

export interface ReasonRunContext {
  frameworkVersion: string;
  rulesVersion: string;
  contentHash: string;
  archiveUrl: string;
}
