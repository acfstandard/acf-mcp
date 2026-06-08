import path from "node:path";
import { describe, expect, it } from "vitest";
import { inferAutonomy } from "../../src/core/infer-autonomy";
import { inferCriticality } from "../../src/core/infer-criticality";
import { inferAiActRole, inferGdprRole } from "../../src/core/infer-roles";
import { RulesLoader } from "../../src/core/rules-loader";

const RULES_ROOT = path.resolve(__dirname, "../../content/rules");
const rules = new RulesLoader({ rulesRoot: RULES_ROOT });

describe("inferAutonomy", () => {
  it("returns N0 for always+read_only", async () => {
    const r = await rules.loadAutonomyInference();
    const out = inferAutonomy(r, {
      human_approval_required: "always",
      external_actions: "read_only",
    });
    expect(out.level).toBe("N0");
  });
  it("returns N3 for never+full_write", async () => {
    const r = await rules.loadAutonomyInference();
    const out = inferAutonomy(r, {
      human_approval_required: "never",
      external_actions: "full_write",
    });
    expect(out.level).toBe("N3");
  });
  it("returns N2 for sometimes+limited_write", async () => {
    const r = await rules.loadAutonomyInference();
    const out = inferAutonomy(r, {
      human_approval_required: "sometimes",
      external_actions: "limited_write",
    });
    expect(out.level).toBe("N2");
  });
});

describe("inferCriticality", () => {
  it("returns critical for sensitive_special+high_corporate", async () => {
    const m = await rules.loadCriticalityMatrix();
    const out = inferCriticality(m, {
      personal_data_level: "sensitive_special",
      financial_exposure: "high_corporate",
    });
    expect(out.score).toBe("critical");
  });
  it("returns low for none+none", async () => {
    const m = await rules.loadCriticalityMatrix();
    const out = inferCriticality(m, {
      personal_data_level: "none",
      financial_exposure: "none",
    });
    expect(out.score).toBe("low");
  });
});

describe("inferAiActRole / inferGdprRole", () => {
  it("returns deployer for internal usage", async () => {
    const r = await rules.loadAiActRoles();
    const out = inferAiActRole(r, {
      text: "internal copilot",
      enums: { usage_audience: ["internal"] },
      flags: [],
    });
    expect(out.role).toBe("deployer");
  });
  it("returns controller for internal usage with PII", async () => {
    const r = await rules.loadGdprQualification();
    const out = inferGdprRole(r, {
      text: "internal copilot handling employee data",
      enums: {
        usage_audience: ["internal"],
        personal_data_level: ["standard"],
      },
      flags: [],
    });
    expect(out.role).toBe("controller");
  });
});
