import path from "node:path";
import { describe, expect, it } from "vitest";
import { createAcfServer } from "../../src/core/server";

const ROOT = path.resolve(__dirname, "../..");

describe("createAcfServer", () => {
  it("returns a server with name+version", async () => {
    const { server, registry } = await createAcfServer({
      contentRoot: path.join(ROOT, "content"),
      rulesRoot: path.join(ROOT, "content", "rules"),
      indexPath: path.join(ROOT, "dist", "search-index.json"),
    });
    expect(server).toBeDefined();
    expect(registry).toBeDefined();
    expect(registry.meta.framework_version).toBe("1.0");
  });

  it("registry exposes ContentLoader, RulesLoader, SearchEngine", async () => {
    const { registry } = await createAcfServer({
      contentRoot: path.join(ROOT, "content"),
      rulesRoot: path.join(ROOT, "content", "rules"),
      indexPath: path.join(ROOT, "dist", "search-index.json"),
    });
    expect(registry.content).toBeDefined();
    expect(registry.rules).toBeDefined();
    expect(registry.search).toBeDefined();
  });
});
