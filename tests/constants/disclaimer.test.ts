import { describe, expect, it } from "vitest";
import { ACF_REASON_DISCLAIMER } from "../../src/constants/disclaimer";

describe("ACF_REASON_DISCLAIMER", () => {
  it("matches the canonical wording", () => {
    expect(ACF_REASON_DISCLAIMER).toMatchInlineSnapshot(
      `"Preliminary qualification produced by the ACF® deterministic engine. Not legal advice. Human review required. Do not use for autonomous regulatory decision-making. See doctrine_archive_url for the version of the doctrine used."`,
    );
  });

  it("is non-empty and longer than 100 chars", () => {
    expect(ACF_REASON_DISCLAIMER.length).toBeGreaterThan(100);
  });
});
