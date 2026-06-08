#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createAcfServer } from "../core/server.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(HERE, "..", "..");

async function main(): Promise<void> {
  const { server } = await createAcfServer({
    contentRoot: path.join(PKG_ROOT, "content"),
    rulesRoot: path.join(PKG_ROOT, "content", "rules"),
    indexPath: path.join(PKG_ROOT, "dist", "search-index.json"),
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`acf-mcp ready (stdio).\n`);
}

main().catch((err) => {
  process.stderr.write(`${(err as Error).stack ?? String(err)}\n`);
  process.exit(1);
});
