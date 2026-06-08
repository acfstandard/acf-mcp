import { AcfLocale, AcfLocaleSchema, SUPPORTED_LOCALES } from "./types";

export interface LocaleNegotiationInput {
  explicit?: string | undefined;
  acceptLanguage?: string | undefined;
  envLocale?: string | undefined;
}

export const DEFAULT_FALLBACK_LOCALE: AcfLocale = "en";
export const AUTHORITY_SOURCE_LOCALE: AcfLocale = "fr";

function tryParseLocale(value: string | undefined): AcfLocale | null {
  if (!value) return null;
  const lower = value.trim().toLowerCase().slice(0, 2);
  const result = AcfLocaleSchema.safeParse(lower);
  return result.success ? result.data : null;
}

function parseAcceptLanguage(header: string): AcfLocale[] {
  return header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.split("-")[0] ?? "")
    .map((code) => tryParseLocale(code))
    .filter((code): code is AcfLocale => code !== null);
}

/**
 * Locale negotiation per spec §8.1:
 *   1. Explicit param (URI ?lang= or tool argument)
 *   2. HTTP Accept-Language
 *   3. ACF_MCP_LOCALE env var (stdio only)
 *   4. DEFAULT_FALLBACK_LOCALE ('en')
 */
export function negotiateLocale(input: LocaleNegotiationInput): AcfLocale {
  const fromExplicit = tryParseLocale(input.explicit);
  if (fromExplicit) return fromExplicit;

  if (input.acceptLanguage) {
    const candidates = parseAcceptLanguage(input.acceptLanguage);
    if (candidates[0]) return candidates[0];
  }

  const fromEnv = tryParseLocale(input.envLocale);
  if (fromEnv) return fromEnv;

  return DEFAULT_FALLBACK_LOCALE;
}

/**
 * Fallback chain used by ContentLoader:
 *   requested → DEFAULT_FALLBACK_LOCALE ('en') → AUTHORITY_SOURCE_LOCALE ('fr')
 * Deduplicated.
 */
export function fallbackChain(requested: AcfLocale): AcfLocale[] {
  const chain: AcfLocale[] = [requested];
  if (!chain.includes(DEFAULT_FALLBACK_LOCALE)) chain.push(DEFAULT_FALLBACK_LOCALE);
  if (!chain.includes(AUTHORITY_SOURCE_LOCALE)) chain.push(AUTHORITY_SOURCE_LOCALE);
  return chain;
}

export { SUPPORTED_LOCALES };
