import { z } from "zod";
import { ContentLoader } from "./content";

/**
 * Flat structure indexed by lunr. One doc per Resource (principle, fiche, guide,
 * glossary entry…). The same doc is added once per locale (FR + EN) — the lunr
 * tokenizer is generic enough; per-locale fine-tuning is V1.1.
 */
export const SearchDocSchema = z.object({
  uri: z.string(),
  title: z.string(),
  snippet: z.string(),
  body: z.string(),
  category: z.enum([
    "principle", "autonomy_level", "dimension", "ddao",
    "fiche", "guide", "whitepaper", "glossary", "meta",
  ]),
  locale: z.enum(["fr", "en"]),
});
export type SearchDoc = z.infer<typeof SearchDocSchema>;

export async function collectSearchDocs(
  loader: ContentLoader,
): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = [];

  for (const locale of ["fr", "en"] as const) {
    /* Principles */
    const principles = await loader.loadPrinciples();
    for (const p of principles) {
      docs.push({
        uri: `acf://framework/principle/${p.code}`,
        title: p.title[locale],
        snippet: p.summary[locale],
        body: `${p.title[locale]} ${p.summary[locale]} ${p.doctrine[locale]}`,
        category: "principle",
        locale,
      });
    }

    /* Autonomy levels */
    const levels = await loader.loadAutonomyLevels();
    for (const l of levels) {
      docs.push({
        uri: `acf://framework/autonomy-level/${l.code}`,
        title: l.title[locale],
        snippet: l.description[locale],
        body: `${l.title[locale]} ${l.description[locale]} ${l.controls[locale]} ${l.examples[locale]}`,
        category: "autonomy_level",
        locale,
      });
    }

    /* Dimensions */
    const dimensions = await loader.loadDimensions();
    for (const d of dimensions) {
      docs.push({
        uri: `acf://framework/dimension/${d.code}`,
        title: d.title[locale],
        snippet: d.description[locale],
        body: `${d.title[locale]} ${d.description[locale]} ${d.practices[locale]}`,
        category: "dimension",
        locale,
      });
    }

    /* DDAO */
    const ddao = await loader.loadDdao();
    docs.push({
      uri: "acf://framework/ddao",
      title: ddao.title[locale],
      snippet: ddao.definition[locale].slice(0, 240),
      body: `${ddao.title[locale]} ${ddao.definition[locale]} ${ddao.responsibilities[locale]} ${ddao.not_to_be_confused_with[locale]}`,
      category: "ddao",
      locale,
    });

    /* Fiches */
    for (let i = 0; i <= 16; i++) {
      const code = `ACF-${String(i).padStart(2, "0")}`;
      try {
        const fiche = await loader.loadFiche(code, locale);
        if (fiche.is_fallback) continue;
        docs.push({
          uri: `acf://fiche/${code}`,
          title: fiche.frontmatter.title,
          snippet: fiche.body.split("\n\n").find((p) => p.trim().length > 40)?.slice(0, 240) ?? "",
          body: `${fiche.frontmatter.title} ${fiche.frontmatter.keywords.join(" ")} ${fiche.body}`,
          category: "fiche",
          locale,
        });
      } catch {
        /* fiche missing in this locale — skip */
      }
    }

    /* Glossary — loadGlossary returns an envelope with locale fallback metadata */
    try {
      const { entries: glossary } = await loader.loadGlossary(locale);
      for (const entry of glossary) {
        docs.push({
          uri: `acf://glossary/${encodeURIComponent(entry.term)}`,
          title: entry.term,
          snippet: entry.definition.slice(0, 240),
          body: `${entry.term} ${entry.expansion ?? ""} ${entry.definition}`,
          category: "glossary",
          locale,
        });
      }
    } catch {
      /* no glossary for this locale */
    }
  }

  return docs;
}
