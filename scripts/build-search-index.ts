#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import lunr from "lunr";
import { ContentLoader } from "../src/core/content";
import { collectSearchDocs } from "../src/core/search-doc";

const ROOT = path.resolve(process.cwd());
const CONTENT_ROOT = path.join(ROOT, "content");
const DIST_DIR = path.join(ROOT, "dist");

async function main(): Promise<void> {
  const loader = new ContentLoader({ contentRoot: CONTENT_ROOT });
  const docs = await collectSearchDocs(loader);

  const docsById = new Map<string, (typeof docs)[number]>();
  for (const doc of docs) docsById.set(`${doc.uri}|${doc.locale}`, doc);

  const idx = lunr(function () {
    this.ref("id");
    this.field("title", { boost: 10 });
    this.field("snippet", { boost: 5 });
    this.field("body");
    for (const [id, doc] of docsById) {
      this.add({ id, title: doc.title, snippet: doc.snippet, body: doc.body });
    }
  });

  await mkdir(DIST_DIR, { recursive: true });
  const out = {
    index: idx,
    docs: Object.fromEntries(docsById),
    built_at: new Date().toISOString(),
    doc_count: docsById.size,
  };
  await writeFile(
    path.join(DIST_DIR, "search-index.json"),
    JSON.stringify(out),
    "utf8",
  );
  console.log(`✓ Search index built: ${docsById.size} docs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
