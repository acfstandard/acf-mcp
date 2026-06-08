import { describe, expect, it } from "vitest";
import { sha256, sha256OfFiles } from "../../src/lib/hash";
import path from "node:path";

describe("lib/hash", () => {
  it("sha256 returns 64-hex digest of a string", () => {
    const out = sha256("hello");
    expect(out).toMatch(/^[a-f0-9]{64}$/);
    expect(out).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  it("sha256OfFiles is stable across calls (single file)", async () => {
    const fixture = path.resolve(__dirname, "../fixtures/content/meta.json");
    const a = await sha256OfFiles([fixture]);
    const b = await sha256OfFiles([fixture]);
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it("sha256OfFiles is order-independent (multi-file)", async () => {
    const meta = path.resolve(__dirname, "../fixtures/content/meta.json");
    const principles = path.resolve(
      __dirname,
      "../fixtures/content/framework/principles.json",
    );
    const ab = await sha256OfFiles([meta, principles]);
    const ba = await sha256OfFiles([principles, meta]);
    expect(ab).toBe(ba);
  });
});
