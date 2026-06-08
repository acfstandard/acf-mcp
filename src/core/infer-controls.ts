import { z } from "zod";
import { DdaoControlsMappingSchema } from "./rule-types";

type Mapping = z.infer<typeof DdaoControlsMappingSchema>;
type LevelKey = "N0" | "N1" | "N2" | "N3";
type RiskKey = "low" | "medium" | "high" | "critical";

const LEVEL_ORDER: LevelKey[] = ["N0", "N1", "N2", "N3"];
const RISK_ORDER: RiskKey[] = ["low", "medium", "high", "critical"];

function clampNext<T extends string>(
  order: T[], value: T, delta: -1 | 1,
): T {
  const i = order.indexOf(value);
  const j = Math.min(order.length - 1, Math.max(0, i + delta));
  return order[j]!;
}

export interface ControlsInput {
  level: LevelKey;
  risk: RiskKey;
}

export function inferDdaoControls(mapping: Mapping, input: ControlsInput) {
  const candidates = [
    { level: input.level, risk: input.risk },
    { level: input.level, risk: clampNext(RISK_ORDER, input.risk, +1) },
    { level: clampNext(LEVEL_ORDER, input.level, +1), risk: input.risk },
    { level: input.level, risk: clampNext(RISK_ORDER, input.risk, -1) },
    { level: clampNext(LEVEL_ORDER, input.level, -1), risk: input.risk },
  ];

  for (const c of candidates) {
    const found = mapping.mappings.find(
      (m) => m.level === c.level && m.risk === c.risk,
    );
    if (found) {
      return {
        recommended_controls: found.recommended_controls,
        ddao_controls: found.ddao_controls,
        rule_id: `ddao-controls-mapping.${c.level}-${c.risk}`,
      };
    }
  }
  return {
    recommended_controls: [],
    ddao_controls: [],
    rule_id: "ddao-controls-mapping.fallback-empty",
  };
}
