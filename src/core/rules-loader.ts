import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  AiActAnnexIIISchema,
  AiActAnnexISchema,
  AiActRolesSchema,
  AutonomyInferenceSchema,
  CriticalityMatrixSchema,
  DdaoControlsMappingSchema,
  GdprQualificationSchema,
  GpaiTriggersSchema,
  RulesMetaSchema,
  SignOffMatrixSchema,
} from "./rule-types";

export interface RulesLoaderOptions {
  rulesRoot: string;
}

export class RulesLoader {
  private readonly root: string;

  constructor(opts: RulesLoaderOptions) {
    this.root = opts.rulesRoot;
  }

  private async loadJson<T>(file: string): Promise<T> {
    const raw = await readFile(path.join(this.root, file), "utf8");
    return JSON.parse(raw) as T;
  }

  async loadRulesMeta() {
    return RulesMetaSchema.parse(await this.loadJson("rules-meta.json"));
  }
  async loadAiActAnnexIII() {
    return AiActAnnexIIISchema.parse(await this.loadJson("ai-act-annex-iii.json"));
  }
  async loadAiActAnnexI() {
    return AiActAnnexISchema.parse(await this.loadJson("ai-act-annex-i.json"));
  }
  async loadGpaiTriggers() {
    return GpaiTriggersSchema.parse(await this.loadJson("gpai-triggers.json"));
  }
  async loadAutonomyInference() {
    return AutonomyInferenceSchema.parse(await this.loadJson("autonomy-inference.json"));
  }
  async loadCriticalityMatrix() {
    return CriticalityMatrixSchema.parse(await this.loadJson("criticality-matrix.json"));
  }
  async loadDdaoControlsMapping() {
    return DdaoControlsMappingSchema.parse(await this.loadJson("ddao-controls-mapping.json"));
  }
  async loadSignOffMatrix() {
    return SignOffMatrixSchema.parse(await this.loadJson("sign-off-matrix.json"));
  }
  async loadGdprQualification() {
    return GdprQualificationSchema.parse(await this.loadJson("gdpr-qualification.json"));
  }
  async loadAiActRoles() {
    return AiActRolesSchema.parse(await this.loadJson("ai-act-roles.json"));
  }
}
