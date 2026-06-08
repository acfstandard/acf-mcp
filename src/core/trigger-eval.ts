import { Trigger } from "./rule-types";
import { negationAwareMatch } from "./negation-aware";

export interface TriggerInput {
  text: string;
  enums: Record<string, string[]>;
  flags: string[];
}

export interface TriggerResult {
  fired: boolean;
  evidence: string[];
}

export function evaluateTrigger(
  trigger: Trigger,
  input: TriggerInput,
): TriggerResult {
  const evidence: string[] = [];
  let fired = false;

  /* Keyword patterns */
  if (trigger.keyword_patterns && trigger.keyword_patterns.length > 0) {
    const r = negationAwareMatch(input.text, trigger.keyword_patterns);
    if (r.matched) {
      fired = true;
      for (const h of r.hits) {
        if (!h.negated) evidence.push(`keyword:${h.pattern}`);
      }
    }
  }

  /* Enum match */
  if (trigger.enum_match) {
    for (const [enumKey, allowed] of Object.entries(trigger.enum_match)) {
      const provided = input.enums[enumKey] ?? [];
      for (const v of provided) {
        if (allowed.includes(v)) {
          fired = true;
          evidence.push(`enum:${enumKey}=${v}`);
        }
      }
    }
  }

  /* Structured flags */
  if (trigger.structured_flags) {
    for (const flag of trigger.structured_flags) {
      if (input.flags.includes(flag)) {
        fired = true;
        evidence.push(`flag:${flag}`);
      }
    }
  }

  return { fired, evidence };
}
