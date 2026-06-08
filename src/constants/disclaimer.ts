/**
 * Canonical disclaimer attached to every REASON tool output.
 *
 * MODIFYING THIS STRING REQUIRES:
 *   1. an explicit PR with rationale,
 *   2. updating the snapshot in tests/constants/disclaimer.test.ts,
 *   3. updating the 6 REASON-tool snapshot tests simultaneously,
 *   4. a changelog entry.
 *
 * The CI snapshot check blocks unilateral changes. Cf. spec §11.1.
 */
export const ACF_REASON_DISCLAIMER =
  "Preliminary qualification produced by the ACF® deterministic engine. " +
  "Not legal advice. Human review required. " +
  "Do not use for autonomous regulatory decision-making. " +
  "See doctrine_archive_url for the version of the doctrine used.";
