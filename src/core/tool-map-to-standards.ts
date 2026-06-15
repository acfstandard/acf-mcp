import { z } from "zod";
import { AcfRegistry } from "./registry";
import { AcfLocale, AcfLocaleSchema } from "./types";
import { ACF_REASON_DISCLAIMER } from "../constants/disclaimer";

const FICHE_REGEX = /^ACF-(0[0-9]|1[0-6])$/;
const SUPPORTED_REGULATIONS = ["ai-act", "gdpr", "dora", "nis2", "iso-42001"] as const;
type SupportedRegulation = typeof SUPPORTED_REGULATIONS[number];

export const MapToStandardsInputSchema = z.object({
  fiche_id: z.string().regex(FICHE_REGEX).optional(),
  regulations: z.array(z.enum(SUPPORTED_REGULATIONS)).optional(),
  locale: AcfLocaleSchema.optional(),
});
export type MapToStandardsInput = z.infer<typeof MapToStandardsInputSchema>;

interface ArticleHit {
  article: string;
  title: string;
  operational_note: string;
  source?: string;
  applicable_date?: string;
}

interface RegulationMapping {
  regulation: SupportedRegulation;
  regulation_label: string;
  articles: ArticleHit[];
}

interface FicheMapping {
  fiche_id: string;
  total_articles: number;
  mappings: RegulationMapping[];
}

export interface MapToStandardsOutput {
  fiches: FicheMapping[];
  total_fiches: number;
  total_articles_referenced: number;
  regulations_covered: SupportedRegulation[];
  doctrine_version: string;
  doctrine_hash: string;
  permanent_archive_url: string;
  regulatory_snapshot: string;
  served_locale: AcfLocale;
  requires_human_review: true;
  disclaimer: string;
  source_note: string;
}

const ALL_FICHE_IDS: string[] = Array.from({ length: 17 }, (_, i) =>
  `ACF-${String(i).padStart(2, "0")}`,
);

export async function handleMapToStandardsTool(
  registry: AcfRegistry,
  rawInput: unknown,
): Promise<MapToStandardsOutput> {
  const input = MapToStandardsInputSchema.parse(rawInput);
  const locale: "fr" | "en" = input.locale === "fr" ? "fr" : "en";
  const servedLocale: AcfLocale = (input.locale ?? "en") as AcfLocale;
  const targetFiches: string[] = input.fiche_id ? [input.fiche_id] : ALL_FICHE_IDS;
  const targetRegulations: SupportedRegulation[] = (input.regulations ??
    [...SUPPORTED_REGULATIONS]) as SupportedRegulation[];

  const data = await registry.content.loadRegulationArticles();

  const ficheMappings: FicheMapping[] = targetFiches.map((ficheId) => {
    const regulationMappings: RegulationMapping[] = [];

    for (const regId of targetRegulations) {
      const reg = data.regulations[regId];
      if (!reg) continue;

      const articleHits: ArticleHit[] = [];
      for (const [articleNumber, article] of Object.entries(reg.articles)) {
        if (article.mapping.fiches.includes(ficheId)) {
          articleHits.push({
            article: articleNumber,
            title: article.title[locale],
            operational_note: article.mapping.operational_note[locale],
            source: article.source,
            applicable_date: article.applicable_date,
          });
        }
      }

      if (articleHits.length > 0) {
        regulationMappings.push({
          regulation: regId,
          regulation_label: reg.label[locale],
          articles: articleHits,
        });
      }
    }

    const totalArticles = regulationMappings.reduce(
      (sum, m) => sum + m.articles.length,
      0,
    );

    return {
      fiche_id: ficheId,
      total_articles: totalArticles,
      mappings: regulationMappings,
    };
  });

  const totalArticlesReferenced = ficheMappings.reduce(
    (sum, f) => sum + f.total_articles,
    0,
  );

  const meta = registry.meta;

  return {
    fiches: ficheMappings,
    total_fiches: ficheMappings.length,
    total_articles_referenced: totalArticlesReferenced,
    regulations_covered: targetRegulations,
    doctrine_version: meta.framework_version,
    doctrine_hash: meta.content_hash,
    permanent_archive_url: meta.permanent_archive_url,
    regulatory_snapshot: data._meta.regulatory_snapshot,
    served_locale: servedLocale,
    requires_human_review: true,
    disclaimer: ACF_REASON_DISCLAIMER,
    source_note:
      "Mappings reflect ACF v1.0 doctrine. The reverse-index is derived from content/guides/regulation-articles.json (the same source consumed by acf.regulation.article). For verbatim regulatory text, consult the cited source instrument.",
  };
}
