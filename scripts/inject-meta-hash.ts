#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readdir, stat } from "node:fs/promises";
import { sha256OfFiles, formatDoctrineHash } from "../src/lib/hash";

const ROOT = path.resolve(process.cwd());
const CONTENT_ROOT = path.join(ROOT, "content");

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  const entries = await readdir(dir);
  for (const e of entries) {
    const full = path.join(dir, e);
    const s = await stat(full);
    if (s.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

async function main(): Promise<void> {
  const files = (await walk(CONTENT_ROOT)).filter(
    (f) => f.endsWith(".json") || f.endsWith(".md"),
  );
  // Exclude meta.json itself so the hash is stable across recomputes.
  const target = files.filter((f) => !f.endsWith("/meta.json") && !f.endsWith("\\meta.json"));
  const hex = await sha256OfFiles(target);
  const metaPath = path.join(CONTENT_ROOT, "meta.json");
  const meta = JSON.parse(await readFile(metaPath, "utf8"));
  meta.content_hash = formatDoctrineHash(hex);
  meta.content_build = new Date().toISOString();
  await writeFile(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf8");
  console.log(`✓ content_hash injected into meta.json: ${meta.content_hash}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
