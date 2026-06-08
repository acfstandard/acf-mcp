/**
 * Canonical problem-first descriptions for the 11 V1.0 tools.
 * Single source of truth — referenced by tools.ts and snapshot tests.
 */

export const TOOL_DESCRIPTIONS = {
  "acf.search":
    "When you don't know which ACF® resource is most relevant to the situation at hand (a question, a regulator request, a board challenge…), search the full ACF® corpus and rank candidate resources by relevance.",
  "acf.fiche.lookup":
    "When facing a specific governance question (defining an agent's mandate, designing a kill switch, building a decision register…), retrieve the canonical ACF® methodological card that applies — with its example, its mapping to principles and its related cards.",
  "acf.regulation.article":
    "When a regulator, an auditor or a board references a specific article (AI Act Art. 9, GDPR Art. 35, DORA Art. 28, NIS2 Art. 21, ISO 42001 §6…), get the verified text and its operational translation into the ACF® framework — which principles it activates, which maturity dimensions it stresses, which fiches operationalise it.",
  "acf.glossary.define":
    "When governance vocabulary becomes ambiguous (what is a DDAO? what does Decision Sovereignty exactly mean? when does an agent transition from N1 to N2?), get the canonical ACF® definition and its connection to the rest of the doctrine.",
  "acf.cite":
    "When writing a thesis, a regulatory filing, a board memo or an academic paper that needs to reference ACF®, produce a properly formatted citation in the requested style (APA, MLA, Chicago, ISO 690, BibTeX).",
  "acf.advisor":
    "When a user describes a real AI use case and needs a structured ACF® governance assessment in return — which principles fire, which maturity dimensions are critical, which autonomy level fits, which regulatory obligations apply, which fiches to mobilise in what order, what are the first operational actions, what are the operational risks. This is the conversion tool: from documentation library to governance advisor.",
  "acf.classify-agent":
    "When a system owner needs a first-pass governance qualification of an AI agent before go-live — what autonomy level it likely operates at, what risk class it likely carries, what regulations apply, what controls to put in place, who should sign off — get one structured preliminary assessment covering all five questions in a single call. Input kept deliberately simple (10 qualified fields); output is structured for human review, not for autonomous regulatory decision-making.",
  "acf.assess-autonomy":
    "When deciding how much autonomy to grant an agent — should it propose, decide or execute? what triggers human review? what is the kill switch design? — get a first-pass assessment grounded in the 4 ACF® autonomy levels with explicit go/no-go criteria, gating thresholds, and uncertainty signalling for human review.",
  "acf.identify-governance-gaps":
    "When auditing your current AI governance setup — what does ACF® suggest you should have that you don't? — get a first-pass gap analysis across the 6 maturity dimensions, prioritised by criticality, with remediation actions, quick wins, and explicit uncertainty signalling on which gaps were inferred vs declared.",
  "acf.map-ai-act-obligations":
    "When a system has been preliminarily qualified as high-risk and you need the exhaustive list of AI Act obligations that apply — Art. 9 risk management, Art. 10 data, Art. 11 docs, Art. 12 logs, Art. 13 transparency, Art. 14 human oversight, Art. 15 robustness, GPAI Art. 51-55 — get the full obligation set structured by lifecycle phase (pre-go-live / continuous / on-incident) with deadlines (incl. Digital Omnibus deferrals) and ACF® operational translation.",
  "acf.assign-ddao-controls":
    "When a DDAO needs concrete controls assigned to an autonomous agent — what kill switches, what escalation thresholds, what audit trails, what documentation, who owns each control — get the ACF® control set scoped to the agent's autonomy level and risk class, with double vocabulary (plain-English recommended_controls + ACF-canonical ddao_controls) for external clarity.",
  "acf.evaluate-agent-mandate":
    "When an existing agent mandate already exists (drafted or proposed for DDAO sign-off) and you need a first-pass audit before go-live or regulatory inspection — does it cover the decision perimeter, the escalation thresholds, the kill switch, the audit trail, the documentation duty? — get a structured preliminary verdict with strengths, gaps, required additions, and explicit gaps_to_validate for the human reviewer.",
} as const;

export type AcfToolName = keyof typeof TOOL_DESCRIPTIONS;
