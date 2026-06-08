#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  AcfLocaleSchema,
  AutonomyLevelSchema,
  DdaoSchema,
  DimensionSchema,
  FicheFrontmatterSchema,
  GlossaryEntrySchema,
  GuideFrontmatterSchema,
  MetaSchema,
  PrincipleSchema,
} from "../src/core/types";

/* -------------------- Forbidden patterns (IP guardrails) -------------------- */

export interface ForbiddenPattern {
  pattern: string;
  matcher: RegExp;
  reason: string;
}

export const FORBIDDEN_PATTERNS: ForbiddenPattern[] = [
  {
    pattern: "INPI 5224709",
    matcher: /\b5224709\b/i,
    reason: "INPI registration number — IP guardrail (spec §11.1)",
  },
  {
    pattern: "INPI 5251856",
    matcher: /\b5251856\b/i,
    reason: "INPI registration number — IP guardrail (spec §11.1)",
  },
  {
    pattern: "INPI FR2605113",
    matcher: /\bFR2605113\b/i,
    reason: "Patent INPI number — IP guardrail (spec §11.1)",
  },
  {
    pattern: "brevet",
    matcher: /\bbrevets?\b/i,
    reason: "Word 'brevet' not allowed in public content — IP guardrail (spec §11.1)",
  },
  {
    pattern: "Decision Engine",
    matcher: /\bDecision\s+Engine\b/i,
    reason: "Decision Engine never exposed publicly — IP guardrail (spec §11.1)",
  },
  {
    pattern: "Souveraineté Agentique (book reference)",
    // Negative lookahead: catches the phrase unless immediately followed by ®.
    // Earlier `[^®]` required a trailing character, missing end-of-string cases.
    matcher: /Souveraineté\s+Agentique(?!®)/i,
    reason:
      "Book title not to be mentioned as upcoming — only the registered mark with ® is allowed",
  },
];

export interface ForbiddenFinding {
  file: string;
  pattern: string;
  reason: string;
  excerpt: string;
}

export function scanForbiddenPatterns(
  file: string,
  body: string,
): ForbiddenFinding[] {
  const findings: ForbiddenFinding[] = [];
  for (const { pattern, matcher, reason } of FORBIDDEN_PATTERNS) {
    const match = matcher.exec(body);
    if (match) {
      const start = Math.max(0, match.index - 30);
      const end = Math.min(body.length, match.index + match[0].length + 30);
      findings.push({
        file,
        pattern,
        reason,
        excerpt: body.slice(start, end),
      });
    }
  }
  return findings;
}

/* -------------------- Walker -------------------- */

async function walk(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await readdir(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) await walk(full, files);
    else files.push(full);
  }
  return files;
}

/* -------------------- Validators -------------------- */

async function validateMeta(root: string, errors: string[]): Promise<void> {
  const file = path.join(root, "meta.json");
  try {
    MetaSchema.parse(JSON.parse(await readFile(file, "utf8")));
  } catch (e) {
    errors.push(`meta.json invalid: ${(e as Error).message}`);
  }
}

async function validateFramework(root: string, errors: string[]): Promise<void> {
  const fwDir = path.join(root, "framework");
  try {
    const p = JSON.parse(
      await readFile(path.join(fwDir, "principles.json"), "utf8"),
    );
    for (const principle of p.principles ?? []) PrincipleSchema.parse(principle);
  } catch (e) {
    errors.push(`principles.json invalid: ${(e as Error).message}`);
  }
  try {
    const a = JSON.parse(
      await readFile(path.join(fwDir, "autonomy-levels.json"), "utf8"),
    );
    for (const level of a.levels ?? []) AutonomyLevelSchema.parse(level);
  } catch (e) {
    errors.push(`autonomy-levels.json invalid: ${(e as Error).message}`);
  }
  try {
    const d = JSON.parse(
      await readFile(path.join(fwDir, "dimensions.json"), "utf8"),
    );
    for (const dim of d.dimensions ?? []) DimensionSchema.parse(dim);
  } catch (e) {
    errors.push(`dimensions.json invalid: ${(e as Error).message}`);
  }
  try {
    DdaoSchema.parse(
      JSON.parse(await readFile(path.join(fwDir, "ddao.json"), "utf8")),
    );
  } catch (e) {
    errors.push(`ddao.json invalid: ${(e as Error).message}`);
  }
}

async function validateFiches(root: string, errors: string[]): Promise<void> {
  const dir = path.join(root, "fiches");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), "utf8");
    try {
      const parsed = matter(raw);
      FicheFrontmatterSchema.parse(parsed.data);
    } catch (e) {
      errors.push(`fiches/${f} invalid: ${(e as Error).message}`);
    }
  }
}

async function validateGlossary(root: string, errors: string[]): Promise<void> {
  const dir = path.join(root, "glossary");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    try {
      const raw = JSON.parse(await readFile(path.join(dir, f), "utf8")) as unknown[];
      for (const entry of raw) GlossaryEntrySchema.parse(entry);
    } catch (e) {
      errors.push(`glossary/${f} invalid: ${(e as Error).message}`);
    }
  }
}

async function validateGuides(root: string, errors: string[]): Promise<void> {
  const dir = path.join(root, "guides");
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return; // guides may not exist yet at scaffold time
  }
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), "utf8");
    try {
      const parsed = matter(raw);
      GuideFrontmatterSchema.parse(parsed.data);
    } catch (e) {
      errors.push(`guides/${f} invalid: ${(e as Error).message}`);
    }
  }
}

/* -------------------- Main -------------------- */

async function main(): Promise<void> {
  const root = path.resolve(process.cwd(), "content");
  const errors: string[] = [];
  const ipFindings: ForbiddenFinding[] = [];

  await validateMeta(root, errors);
  await validateFramework(root, errors);
  await validateFiches(root, errors);
  await validateGlossary(root, errors);
  await validateGuides(root, errors);

  const allFiles = await walk(root);
  for (const file of allFiles) {
    if (!file.endsWith(".md") && !file.endsWith(".json")) continue;
    const body = await readFile(file, "utf8");
    ipFindings.push(...scanForbiddenPatterns(file, body));
  }

  if (errors.length > 0) {
    console.error("Content validation errors:");
    for (const e of errors) console.error(`  - ${e}`);
  }

  if (ipFindings.length > 0) {
    console.error("IP guardrail violations:");
    for (const f of ipFindings) {
      console.error(
        `  - ${f.file} :: ${f.pattern} (${f.reason})\n    excerpt: ${f.excerpt}`,
      );
    }
  }

  if (errors.length + ipFindings.length > 0) {
    process.exit(1);
  }

  console.log(
    `✓ Content validation passed (${allFiles.length} files scanned, ${FORBIDDEN_PATTERNS.length} patterns checked).`,
  );
}

if (process.argv[1]?.endsWith("validate-content.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

// Ensure unused import is referenced for tree-shaking safety:
void AcfLocaleSchema;
