import { ContentLoader } from "./content";
import { RulesLoader } from "./rules-loader";
import { SearchEngine } from "./search";
import { Meta } from "./types";

export interface AcfRegistry {
  content: ContentLoader;
  rules: RulesLoader;
  search: SearchEngine;
  meta: Meta;
}
