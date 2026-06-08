import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export function sha256(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Hash a set of files in a stable, order-independent way.
 * Used at build time to compute the doctrine_hash embedded in every REASON output.
 */
export async function sha256OfFiles(files: string[]): Promise<string> {
  const sorted = [...files].sort();
  const h = createHash("sha256");
  for (const f of sorted) {
    const data = await readFile(f);
    h.update(f);
    h.update("\0");
    h.update(sha256(data));
    h.update("\n");
  }
  return h.digest("hex");
}

export function formatDoctrineHash(hex: string): string {
  return `sha256:${hex}`;
}
