export interface NegationAwareHit {
  pattern: string;
  index: number;
  negated: boolean;
}

export interface NegationAwareResult {
  matched: boolean;
  hits: NegationAwareHit[];
}

/**
 * Simple negation-aware matcher (V1.0). Per spec §5.7:
 *   - Regex find each pattern in `text` (case-insensitive)
 *   - For each hit, look backward 40 chars for a negation token in FR or EN
 *   - Mark the hit as negated if a negation precedes within that window
 *   - The overall `matched` flag is true iff at least one non-negated hit exists
 *
 * Trade-off: this is a "good enough" baseline. False positives are mitigated by
 * (a) presence of optional enums (ai_act_triggers / processing_purposes) which
 * take precedence when provided, (b) confidence flagged accordingly, and (c)
 * requires_human_review: true on every REASON output.
 */
const NEGATION_TOKENS = [
  // FR
  "n'a pas", "n'est pas", "ne pas", "ne sont pas", "n'analyse pas",
  "pas de", "aucun", "aucune", "jamais", "n'... jamais", "ne... jamais",
  // EN
  "not ", "no ", "never", "without", "absent",
];

const NEGATION_WINDOW = 40;

const NEGATION_REGEX = new RegExp(
  `(${NEGATION_TOKENS
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "i",
);

export function negationAwareMatch(
  text: string,
  patterns: string[],
): NegationAwareResult {
  const lower = text.toLowerCase();
  const hits: NegationAwareHit[] = [];

  for (const pattern of patterns) {
    const p = pattern.toLowerCase();
    let from = 0;
    while (from <= lower.length) {
      const i = lower.indexOf(p, from);
      if (i === -1) break;
      const windowStart = Math.max(0, i - NEGATION_WINDOW);
      const before = lower.slice(windowStart, i);
      const negated = NEGATION_REGEX.test(before);
      hits.push({ pattern, index: i, negated });
      from = i + p.length;
    }
  }

  return {
    matched: hits.some((h) => !h.negated),
    hits,
  };
}
