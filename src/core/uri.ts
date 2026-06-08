import { AcfLocale, AcfLocaleSchema } from "./types";

export type AcfUriCategory =
  | "framework_principle"
  | "framework_autonomy_level"
  | "framework_dimension"
  | "framework_ddao"
  | "fiche"
  | "guide"
  | "whitepaper"
  | "whitepaper_toc"
  | "whitepaper_section"
  | "manual"
  | "manual_toc"
  | "manual_section"
  | "deck"
  | "glossary"
  | "glossary_entry"
  | "meta";

export interface AcfUriParsed {
  category: AcfUriCategory;
  id?: string;
  locale?: AcfLocale;
}

const PREFIX = "acf://";

export function parseAcfUri(uri: string): AcfUriParsed {
  if (!uri.startsWith(PREFIX)) {
    throw new Error(`Invalid scheme — expected acf://, got: ${uri}`);
  }
  const rest = uri.slice(PREFIX.length);
  const [pathPart, queryPart] = rest.split("?", 2);
  if (pathPart === undefined) {
    throw new Error(`Empty URI: ${uri}`);
  }
  const segments = pathPart.split("/").filter(Boolean);

  let locale: AcfLocale | undefined;
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const lang = params.get("lang");
    if (lang) {
      const parsed = AcfLocaleSchema.safeParse(lang);
      if (parsed.success) locale = parsed.data;
    }
  }

  // Routing table
  if (segments[0] === "framework") {
    if (segments[1] === "principle" && segments[2]) {
      return { category: "framework_principle", id: segments[2], locale };
    }
    if (segments[1] === "autonomy-level" && segments[2]) {
      return { category: "framework_autonomy_level", id: segments[2], locale };
    }
    if (segments[1] === "dimension" && segments[2]) {
      return { category: "framework_dimension", id: segments[2], locale };
    }
    if (segments[1] === "ddao") {
      return { category: "framework_ddao", id: undefined, locale };
    }
  }
  if (segments[0] === "fiche" && segments[1]) {
    return { category: "fiche", id: segments[1], locale };
  }
  if (segments[0] === "guide" && segments[1]) {
    return { category: "guide", id: segments[1], locale };
  }
  if (segments[0] === "whitepaper") {
    if (!segments[1]) return { category: "whitepaper", id: undefined, locale };
    if (segments[1] === "toc")
      return { category: "whitepaper_toc", id: undefined, locale };
    if (segments[1] === "section" && segments[2]) {
      return { category: "whitepaper_section", id: segments[2], locale };
    }
  }
  if (segments[0] === "manual") {
    if (!segments[1]) return { category: "manual", id: undefined, locale };
    if (segments[1] === "toc")
      return { category: "manual_toc", id: undefined, locale };
    if (segments[1] === "section" && segments[2]) {
      return { category: "manual_section", id: segments[2], locale };
    }
  }
  if (segments[0] === "deck") {
    return { category: "deck", id: undefined, locale };
  }
  if (segments[0] === "glossary") {
    if (!segments[1]) return { category: "glossary", id: undefined, locale };
    return {
      category: "glossary_entry",
      id: decodeURIComponent(segments[1]),
      locale,
    };
  }
  if (segments[0] === "meta") {
    return { category: "meta", id: undefined, locale };
  }
  throw new Error(`Unknown ACF URI: ${uri}`);
}
