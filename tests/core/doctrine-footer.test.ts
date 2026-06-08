import { describe, expect, it } from "vitest";
import { buildDoctrineFooter, REGULATORY_SNAPSHOT } from "../../src/core/doctrine-footer";

describe("buildDoctrineFooter", () => {
  it("returns all 5 traceability fields + disclaimer", () => {
    const out = buildDoctrineFooter({
      frameworkVersion: "1.0",
      rulesVersion: "2026-06",
      contentHash: "sha256:abc",
      archiveUrl: "https://archive.acfstandard.com/doctrine/v1.0/",
    });
    expect(out.doctrine_version).toBe("ACF framework v1.0 / rules 2026-06");
    expect(out.doctrine_hash).toMatch(/^sha256:/);
    expect(out.doctrine_archive_url).toMatch(/^https:/);
    expect(out.regulatory_snapshot).toContain("EU AI Act");
    expect(out.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(out.disclaimer.length).toBeGreaterThan(100);
    expect(out.requires_human_review).toBe(true);
  });

  it("REGULATORY_SNAPSHOT names the in-scope corpus", () => {
    expect(REGULATORY_SNAPSHOT).toMatch(/AI Act/);
    expect(REGULATORY_SNAPSHOT).toMatch(/GDPR/);
    expect(REGULATORY_SNAPSHOT).toMatch(/DORA/);
    expect(REGULATORY_SNAPSHOT).toMatch(/NIS2/);
    expect(REGULATORY_SNAPSHOT).toMatch(/ISO 42001/);
  });
});
