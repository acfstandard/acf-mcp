import { ACF_REASON_DISCLAIMER } from "../constants/disclaimer";

/**
 * Regulatory snapshot — names every corpus the engine reasoned against,
 * with the date of the snapshot. Bumped any time a regulation evolves.
 */
export const REGULATORY_SNAPSHOT =
  "EU AI Act (Reg. 2024/1689, incl. Digital Omnibus deferral) + GDPR (Reg. 2016/679) " +
  "+ DORA (Reg. 2022/2554) + NIS2 (Dir. 2022/2555) + ISO 42001:2023 — as of 2026-06-07";

export interface DoctrineFooterInput {
  frameworkVersion: string;
  rulesVersion: string;
  contentHash: string;
  archiveUrl: string;
}

export interface DoctrineFooter {
  doctrine_version: string;
  doctrine_hash: string;
  doctrine_archive_url: string;
  regulatory_snapshot: string;
  generated_at: string;
  requires_human_review: true;
  disclaimer: string;
}

export function buildDoctrineFooter(
  input: DoctrineFooterInput,
): DoctrineFooter {
  return {
    doctrine_version: `ACF framework v${input.frameworkVersion} / rules ${input.rulesVersion}`,
    doctrine_hash: input.contentHash,
    doctrine_archive_url: input.archiveUrl,
    regulatory_snapshot: REGULATORY_SNAPSHOT,
    generated_at: new Date().toISOString(),
    requires_human_review: true,
    disclaimer: ACF_REASON_DISCLAIMER,
  };
}
