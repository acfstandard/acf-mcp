import path from "node:path";
import { describe, expect, it } from "vitest";
import { RulesLoader } from "../../src/core/rules-loader";

const RULES_ROOT = path.resolve(__dirname, "../../content/rules");

describe("RulesLoader", () => {
  const loader = new RulesLoader({ rulesRoot: RULES_ROOT });

  it("loads rules meta", async () => {
    const meta = await loader.loadRulesMeta();
    expect(meta.rules_version).toMatch(/^\d{4}-\d{2}$/);
  });

  it("loads ai-act-annex-iii with at least 5 categories", async () => {
    const r = await loader.loadAiActAnnexIII();
    expect(r.categories.length).toBeGreaterThanOrEqual(5);
  });

  it("loads gpai-triggers with Article 53", async () => {
    const r = await loader.loadGpaiTriggers();
    expect(r.obligations.some((o) => o.article === "art-53")).toBe(true);
  });

  it("loads autonomy-inference with N0 → N3 thresholds", async () => {
    const r = await loader.loadAutonomyInference();
    const levels = r.thresholds.map((t) => t.level);
    expect(levels).toContain("N0");
    expect(levels).toContain("N3");
  });

  it("loads criticality-matrix", async () => {
    const r = await loader.loadCriticalityMatrix();
    expect(r.cells.length).toBeGreaterThan(0);
  });

  it("loads ddao-controls-mapping", async () => {
    const r = await loader.loadDdaoControlsMapping();
    expect(r.mappings.length).toBeGreaterThan(0);
  });

  it("loads sign-off-matrix", async () => {
    const r = await loader.loadSignOffMatrix();
    expect(r.rules.length).toBeGreaterThan(0);
  });

  it("loads gdpr-qualification", async () => {
    const r = await loader.loadGdprQualification();
    expect(r.cases.length).toBeGreaterThan(0);
  });

  it("loads ai-act-roles", async () => {
    const r = await loader.loadAiActRoles();
    expect(r.rules.length).toBeGreaterThan(0);
  });
});
