import { createHash } from "node:crypto";

/**
 * Logs whitelist per spec §9.4.
 * NEVER ADD a field that could carry user content (description, mandate_text,
 * decisions_taken, agent_purpose, etc.).
 */
export const ALLOWED_LOG_FIELDS = new Set([
  "type",
  "method",
  "tool",
  "uri_pattern",
  "scope",
  "served_locale",
  "duration_ms",
  "status",
  "error_code",
  "request_id",
  "ip_hash",
  "doctrine_version",
  "rate_limit_scope",
  "cold_start",
]);

export function sanitizeForLog(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => ALLOWED_LOG_FIELDS.has(k)),
  );
}

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}|${ip}`).digest("hex");
}

export interface RequestLogContext {
  type: "mcp.request";
  method?: string;
  tool?: string;
  uri_pattern?: string;
  scope?: string;
  served_locale?: string;
  duration_ms?: number;
  status: "ok" | "error";
  error_code?: string;
  request_id: string;
  ip_hash: string;
  doctrine_version?: string;
  rate_limit_scope?: string;
  cold_start?: boolean;
}

export function emitLog(ctx: RequestLogContext): void {
  // Stderr to keep stdio MCP channel clean; HTTP variant captures via Vercel.
  process.stderr.write(`${JSON.stringify(sanitizeForLog({ ...ctx }))}\n`);
}
