import { Confidence } from "./rule-types";

export interface ConfidenceInputs {
  ruleBaseConfidence: Confidence;
  enumProvided: boolean;
  contextFieldsProvided: number; // sector, jurisdiction, gpai_used…
  contradictions: number;
}

const ORDER: Confidence[] = ["low", "medium", "high"];

function step(c: Confidence, delta: number): Confidence {
  const i = ORDER.indexOf(c);
  const j = Math.min(ORDER.length - 1, Math.max(0, i + delta));
  return ORDER[j]!;
}

export function aggregateConfidence(input: ConfidenceInputs): Confidence {
  let current = input.ruleBaseConfidence;

  if (input.enumProvided) current = step(current, +0);
  else current = step(current, -1);

  if (input.contextFieldsProvided >= 3) current = step(current, +0);
  else if (input.contextFieldsProvided === 0) current = step(current, -1);

  if (input.contradictions === 1) current = step(current, -1);
  else if (input.contradictions >= 2) current = step(current, -2);

  return current;
}
