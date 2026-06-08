export interface RateLimitTier {
  key: string;
  perIpLimit: number;
  globalLimit: number;
}

export const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  "mcp.search": { key: "mcp.search", perIpLimit: 60, globalLimit: 1000 },
  "mcp.fiche": { key: "mcp.fiche", perIpLimit: 60, globalLimit: 1000 },
  "mcp.reason": { key: "mcp.reason", perIpLimit: 30, globalLimit: 500 },
  "mcp.heavy-read": { key: "mcp.heavy-read", perIpLimit: 15, globalLimit: 200 },
};

const REASON_TOOLS = new Set([
  "acf.advisor",
  "acf.classify-agent",
  "acf.assess-autonomy",
  "acf.identify-governance-gaps",
  "acf.map-ai-act-obligations",
  "acf.assign-ddao-controls",
  "acf.evaluate-agent-mandate",
]);

const FICHE_TOOLS = new Set([
  "acf.fiche.lookup", "acf.glossary.define", "acf.cite", "acf.regulation.article",
]);

const HEAVY_READ_URI_PATTERNS = [
  /^acf:\/\/whitepaper(?:\?|$)/, // full whitepaper
  /^acf:\/\/manual(?:\?|$)/,
  /^acf:\/\/guide\/[a-z0-9-]+(?:\?|$)/,
];

export interface ToolPickInput {
  method: string;
  toolName?: string;
  uri?: string;
}

export function pickRateLimitConfig(input: ToolPickInput): RateLimitTier {
  if (input.method === "tools/call" && input.toolName) {
    if (REASON_TOOLS.has(input.toolName)) return RATE_LIMIT_TIERS["mcp.reason"]!;
    if (FICHE_TOOLS.has(input.toolName)) return RATE_LIMIT_TIERS["mcp.fiche"]!;
    if (input.toolName === "acf.search") return RATE_LIMIT_TIERS["mcp.search"]!;
  }
  if (input.method === "resources/read" && input.uri) {
    if (HEAVY_READ_URI_PATTERNS.some((p) => p.test(input.uri!))) {
      return RATE_LIMIT_TIERS["mcp.heavy-read"]!;
    }
    return RATE_LIMIT_TIERS["mcp.fiche"]!;
  }
  return RATE_LIMIT_TIERS["mcp.search"]!;
}

interface Bucket {
  count: number;
  windowStart: number;
}

const perIpBuckets = new Map<string, Bucket>();
const globalBuckets = new Map<string, Bucket>();

export interface RateLimitCheckInput extends RateLimitTier {
  windowMs: number;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfter?: number;
  reason?: "per_ip" | "global";
}

function consume(
  bucketMap: Map<string, Bucket>,
  bucketKey: string,
  limit: number,
  windowMs: number,
  now: number,
): boolean {
  const existing = bucketMap.get(bucketKey);
  if (!existing || now - existing.windowStart > windowMs) {
    bucketMap.set(bucketKey, { count: 1, windowStart: now });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

export function checkRateLimit(
  ip: string,
  input: RateLimitCheckInput,
): RateLimitCheckResult {
  const now = Date.now();
  const ipKey = `${input.key}|${ip}`;
  const ipOk = consume(perIpBuckets, ipKey, input.perIpLimit, input.windowMs, now);
  if (!ipOk) {
    return {
      allowed: false,
      retryAfter: Math.ceil(input.windowMs / 1000),
      reason: "per_ip",
    };
  }
  const globalOk = consume(
    globalBuckets, input.key, input.globalLimit, input.windowMs, now,
  );
  if (!globalOk) {
    return {
      allowed: false,
      retryAfter: Math.ceil(input.windowMs / 1000),
      reason: "global",
    };
  }
  return { allowed: true };
}

export function _resetForTests() {
  perIpBuckets.clear();
  globalBuckets.clear();
}
