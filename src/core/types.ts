import { z } from "zod";

/**
 * Supported locales — V1.0 ships FR + EN translated; 11 others fall back to EN
 * (cf. spec §8.3). Infrastructure supports all 13 codes uniformly.
 */
export const SUPPORTED_LOCALES = [
  "fr", "en", "es", "de", "pt", "it", "nl", "ru", "ar", "tr", "ja", "zh", "ko",
] as const;

export const AcfLocaleSchema = z.enum(SUPPORTED_LOCALES);
export type AcfLocale = z.infer<typeof AcfLocaleSchema>;

/**
 * Localized string: at minimum FR + EN must be provided.
 */
export const LocalizedStringSchema = z
  .object({
    fr: z.string(),
    en: z.string(),
  })
  .catchall(z.string());
export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

/* -------------------- Framework -------------------- */

export const PrincipleSchema = z.object({
  id: z.string().regex(/^P[1-4]$/),
  code: z.string().regex(/^P[1-4]$/),
  title: LocalizedStringSchema,
  summary: LocalizedStringSchema,
  doctrine: LocalizedStringSchema,
  related_fiches: z.array(z.string().regex(/^ACF-(0[0-9]|1[0-6])$/)),
  related_dimensions: z.array(z.string().regex(/^D[1-6]$/)),
});
export type Principle = z.infer<typeof PrincipleSchema>;

export const AutonomyLevelSchema = z.object({
  id: z.string().regex(/^N[0-3]$/),
  code: z.string().regex(/^N[0-3]$/),
  title: LocalizedStringSchema,
  description: LocalizedStringSchema,
  controls: LocalizedStringSchema,
  examples: LocalizedStringSchema,
});
export type AutonomyLevel = z.infer<typeof AutonomyLevelSchema>;

export const DimensionSchema = z.object({
  id: z.string().regex(/^D[1-6]$/),
  code: z.string().regex(/^D[1-6]$/),
  title: LocalizedStringSchema,
  description: LocalizedStringSchema,
  practices: LocalizedStringSchema,
});
export type Dimension = z.infer<typeof DimensionSchema>;

export const DdaoSchema = z.object({
  title: LocalizedStringSchema,
  expansion: z.literal("Delegated Decision Agent Officer"),
  definition: LocalizedStringSchema,
  responsibilities: LocalizedStringSchema,
  not_to_be_confused_with: LocalizedStringSchema,
});
export type Ddao = z.infer<typeof DdaoSchema>;

/* -------------------- Fiches -------------------- */

export const RelatedArticleSchema = z.object({
  regulation: z.enum(["ai-act", "gdpr", "dora", "nis2", "iso-42001"]),
  article: z.string(),
  paragraph: z.string().optional(),
});

export const FicheFrontmatterSchema = z.object({
  code: z.string().regex(/^ACF-(0[0-9]|1[0-6])$/),
  slug: z.string().min(1),
  title: z.string().min(1),
  title_en: z.string().optional(),
  order: z.number().int().min(0).max(16),
  maturity_dimension: z.string().regex(/^D[1-6]$/).optional(),
  related_principles: z.array(z.string().regex(/^P[1-4]$/)).optional(),
  related_articles: z.array(RelatedArticleSchema).optional(),
  related_fiches: z.array(z.string().regex(/^ACF-(0[0-9]|1[0-6])$/)).optional(),
  keywords: z.array(z.string()),
  version: z.string(),
  pdf_url: z.string().optional(),
});
export type FicheFrontmatter = z.infer<typeof FicheFrontmatterSchema>;

export interface FicheDocument {
  frontmatter: FicheFrontmatter;
  body: string;
  served_locale: AcfLocale;
  is_fallback: boolean;
}

/* -------------------- Guides -------------------- */

export const ApplicableDateSchema = z.object({
  obligation: z.string(),
  date: z.string(),
});

export const GuideFrontmatterSchema = z.object({
  regulation: z.enum(["ai-act", "gdpr", "dora", "nis2", "iso-42001"]),
  title: z.string().min(1),
  title_en: z.string().optional(),
  version: z.string(),
  last_update: z.string(),
  applicable_dates: z.array(ApplicableDateSchema).optional(),
});
export type GuideFrontmatter = z.infer<typeof GuideFrontmatterSchema>;

export interface GuideDocument {
  frontmatter: GuideFrontmatter;
  body: string;
  served_locale: AcfLocale;
  is_fallback: boolean;
}

/* -------------------- Glossary -------------------- */

export const GlossaryEntrySchema = z.object({
  term: z.string().min(1),
  expansion: z.string().optional(),
  definition: z.string().min(1),
  related_principles: z.array(z.string().regex(/^P[1-4]$/)).optional(),
  related_fiches: z.array(z.string().regex(/^ACF-(0[0-9]|1[0-6])$/)).optional(),
});
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;

/* -------------------- Whitepaper / Manual -------------------- */

export const WhitepaperSectionSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  body: z.string(),
});
export type WhitepaperSection = z.infer<typeof WhitepaperSectionSchema>;

export interface WhitepaperDocument {
  toc: WhitepaperSection[];
  full_body: string;
  served_locale: AcfLocale;
  is_fallback: boolean;
}

/* -------------------- Meta -------------------- */

export const MetaSchema = z.object({
  framework_version: z.string(),
  content_build: z.string(),
  content_hash: z.string().startsWith("sha256:"),
  doctrine_signature: z.string().optional(),
  permanent_archive_url: z.string().url(),
  rules_version: z.string(),
  locales: z.array(AcfLocaleSchema),
  fallback_locale: AcfLocaleSchema,
});
export type Meta = z.infer<typeof MetaSchema>;

/* -------------------- Resolved-content union (returned by ContentLoader) -------------------- */

export type ResolvedContent =
  | { kind: "principle"; data: Principle }
  | { kind: "autonomy_level"; data: AutonomyLevel }
  | { kind: "dimension"; data: Dimension }
  | { kind: "ddao"; data: Ddao }
  | { kind: "fiche"; data: FicheDocument }
  | { kind: "guide"; data: GuideDocument }
  | { kind: "whitepaper"; data: WhitepaperDocument }
  | { kind: "glossary_entry"; data: GlossaryEntry }
  | { kind: "glossary_index"; data: GlossaryEntry[] }
  | { kind: "meta"; data: Meta };
