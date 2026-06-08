import { readFile } from "node:fs/promises";
import lunr from "lunr";
import { AcfLocale } from "./types";
import { SearchDoc } from "./search-doc";

export interface SearchInput {
  query: string;
  scope:
    | "all" | "framework" | "fiche" | "guide" | "whitepaper" | "glossary";
  locale: AcfLocale;
  limit: number;
}

export interface SearchHit {
  uri: string;
  title: string;
  snippet: string;
  score: number;
  category: SearchDoc["category"];
  locale: AcfLocale;
}

interface SerialisedIndex {
  index: object;
  docs: Record<string, SearchDoc>;
  built_at: string;
  doc_count: number;
}

const FRAMEWORK_CATEGORIES = new Set([
  "principle", "autonomy_level", "dimension", "ddao",
]);

/**
 * Category relevance multiplier applied after lunr scoring.
 * Principle/framework content is promoted slightly over glossary/fiche so that
 * canonical framework queries (e.g. "souveraineté") return the authoritative
 * principle record first, not a glossary synonym that happens to have a higher
 * raw TF-IDF score due to a shorter body.
 */
const CATEGORY_SCORE_MULTIPLIER: Record<SearchDoc["category"], number> = {
  principle: 1.15,
  autonomy_level: 1.10,
  dimension: 1.10,
  ddao: 1.10,
  fiche: 1.05,
  guide: 1.02,
  whitepaper: 1.00,
  glossary: 0.90,
  meta: 0.80,
};

export class SearchEngine {
  private constructor(
    private readonly idx: lunr.Index,
    private readonly docs: Map<string, SearchDoc>,
  ) {}

  static async fromFile(file: string): Promise<SearchEngine> {
    const raw = JSON.parse(await readFile(file, "utf8")) as SerialisedIndex;
    const idx = lunr.Index.load(raw.index);
    const docs = new Map(Object.entries(raw.docs));
    return new SearchEngine(idx, docs);
  }

  static fromMemory(serialised: SerialisedIndex): SearchEngine {
    const idx = lunr.Index.load(serialised.index);
    const docs = new Map(Object.entries(serialised.docs));
    return new SearchEngine(idx, docs);
  }

  /**
   * Normalise a query string the same way lunr normalises indexed tokens:
   * - strip combining diacritics (é → e, ü → u, ç → c, etc.)
   * - lower-case
   * This ensures "souveraineté" matches the stored token "souverainete".
   */
  private static normaliseQuery(q: string): string {
    return q
      .normalize("NFD")
      .replace(/\p{Mn}/gu, "") // strip combining diacritics
      .toLowerCase();
  }

  search(input: SearchInput): SearchHit[] {
    const normalisedQuery = SearchEngine.normaliseQuery(input.query);
    let lunrResults: lunr.Index.Result[];
    try {
      lunrResults = this.idx.search(normalisedQuery);
    } catch {
      // lunr throws on certain special characters — sanitise to a wildcard search
      const sanitised = normalisedQuery.replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
      lunrResults = sanitised ? this.idx.search(sanitised) : [];
    }

    // Collect all filtered results, apply category multiplier, re-sort, then slice.
    // This promotes canonical framework docs (principles, levels, dimensions) above
    // glossary synonyms that may have higher raw TF-IDF due to shorter bodies.
    const candidates: SearchHit[] = [];
    for (const r of lunrResults) {
      const doc = this.docs.get(r.ref);
      if (!doc) continue;
      if (doc.locale !== input.locale) continue;
      if (!this.matchesScope(doc.category, input.scope)) continue;
      const multiplier = CATEGORY_SCORE_MULTIPLIER[doc.category] ?? 1.0;
      candidates.push({
        uri: doc.uri,
        title: doc.title,
        snippet: doc.snippet,
        score: r.score * multiplier,
        category: doc.category,
        locale: doc.locale,
      });
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, input.limit);
  }

  private matchesScope(
    category: SearchDoc["category"],
    scope: SearchInput["scope"],
  ): boolean {
    if (scope === "all") return true;
    if (scope === "framework") return FRAMEWORK_CATEGORIES.has(category);
    if (scope === "fiche") return category === "fiche";
    if (scope === "guide") return category === "guide";
    if (scope === "whitepaper") return category === "whitepaper";
    if (scope === "glossary") return category === "glossary";
    return false;
  }
}
