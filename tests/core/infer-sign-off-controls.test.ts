import path from "node:path";
import { describe, expect, it } from "vitest";
import { RulesLoader } from "../../src/core/rules-loader";
import { inferSignOff } from "../../src/core/infer-sign-off";
import { inferDdaoControls } from "../../src/core/infer-controls";

const rules = new RulesLoader({
  rulesRoot: path.resolve(__dirname, "../../content/rules"),
});

describe("inferSignOff", () => {
  it("requires board on critical+sensitive+high_corporate", async () => {
    const m = await rules.loadSignOffMatrix();
    const out = inferSignOff(m, {
      criticality: "critical",
      personal_data_level: "sensitive_special",
      financial_exposure: "high_corporate",
    });
    expect(out.required.board).toBe(true);
    expect(out.required.legal).toBe(true);
  });
  it("does not require board on medium+standard+low", async () => {
    const m = await rules.loadSignOffMatrix();
    const out = inferSignOff(m, {
      criticality: "medium",
      personal_data_level: "standard",
      financial_exposure: "low_operation",
    });
    expect(out.required.board).toBe(false);
  });
});

describe("inferDdaoControls", () => {
  it("returns N2/high controls", async () => {
    const m = await rules.loadDdaoControlsMapping();
    const out = inferDdaoControls(m, { level: "N2", risk: "high" });
    expect(out.recommended_controls.length).toBeGreaterThan(0);
    expect(out.ddao_controls.length).toBeGreaterThan(0);
  });
  it("returns N3/critical controls (richer)", async () => {
    const m = await rules.loadDdaoControlsMapping();
    const out = inferDdaoControls(m, { level: "N3", risk: "critical" });
    expect(out.recommended_controls.length).toBeGreaterThanOrEqual(5);
  });
});
