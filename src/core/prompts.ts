import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AcfRegistry } from "./registry";

interface AcfPrompt {
  name: string;
  description: string;
  arguments: { name: string; description: string; required: boolean }[];
  render: (args: Record<string, unknown>) => string;
}

function s(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  return v === undefined || v === null ? "" : String(v);
}

export const ACF_PROMPTS: AcfPrompt[] = [
  {
    name: "acf.brief-dpia",
    description:
      "When you need to draft a defensible DPIA — one that will hold against a CNIL inspection or a board challenge — get a structured first draft organised by ACF® governance dimensions with the right legal references already in place.",
    arguments: [
      { name: "system_name", description: "Name of the AI system.", required: true },
      { name: "system_description", description: "What the system does.", required: true },
      { name: "deployment_context", description: "Geography, scale, audience.", required: true },
      { name: "high_risk_qualified", description: "Whether the system is already qualified as high-risk.", required: false },
    ],
    render: (args) => [
      "I need to draft a defensible DPIA for the following AI system:",
      "",
      `- Name: ${s(args, "system_name")}`,
      `- Description: ${s(args, "system_description")}`,
      `- Deployment context: ${s(args, "deployment_context")}`,
      `- High-risk qualified: ${s(args, "high_risk_qualified") || "to confirm"}`,
      "",
      "Load the canonical ACF® doctrine first:",
      "- acf://guide/gdpr (Article 35 + DPIA methodology)",
      "- acf://fiche/ACF-11 (risk assessment template)",
      "- acf://fiche/ACF-02 (criticality matrix)",
      "- acf://fiche/ACF-05 (decision register requirement)",
      "",
      "Then produce a DPIA structured by ACF® governance dimensions (D5 first), with explicit legal references (GDPR Art. 35, AI Act Art. 9/10/14 if applicable). Cite the doctrine_archive_url in the conclusion.",
      "",
      "Mark every assumption explicitly and signal what the human reviewer must confirm before submission.",
    ].join("\n"),
  },
  {
    name: "acf.brief-art49-register",
    description:
      "When you need to register a high-risk AI system in the EU AI Act Article 49 public register and you want the entry to be both compliant and consistent with your internal ACF® decisions register.",
    arguments: [
      { name: "system_name", description: "Name of the AI system.", required: true },
      { name: "provider_or_deployer", description: "Role of the entity ('provider' / 'deployer').", required: true },
      { name: "annex_iii_use_case", description: "Which Annex III item applies.", required: true },
    ],
    render: (args) => [
      "I need to prepare an entry for the EU AI Act Article 49 public register.",
      "",
      `- System: ${s(args, "system_name")}`,
      `- Role: ${s(args, "provider_or_deployer")}`,
      `- Annex III use case: ${s(args, "annex_iii_use_case")}`,
      "",
      "Load:",
      "- acf://guide/ai-act (Article 49 + annex III canonical mapping)",
      "- acf://fiche/ACF-05 (internal decision register format)",
      "- acf://fiche/ACF-11 (risk assessment)",
      "",
      "Then produce the Article 49 entry in JSON, ensuring it is consistent with the internal ACF® decision register (same identifiers, same scope). Flag any inconsistency that must be resolved before submission.",
    ].join("\n"),
  },
  {
    name: "acf.brief-board-report",
    description:
      "When the Board asks for a quarterly AI governance report and you want a presentable draft — executive style, hard numbers, risk heatmap, remediation status — that you can hand over without rewriting.",
    arguments: [
      { name: "quarter", description: "Reporting quarter (e.g. 'Q3 2026').", required: true },
      { name: "ai_systems_count", description: "Number of AI systems in production.", required: true },
      { name: "high_risk_count", description: "Number of high-risk systems.", required: false },
      { name: "open_remediations", description: "Number of open remediation items.", required: false },
      { name: "context_notes", description: "Free text — major events of the quarter.", required: false },
    ],
    render: (args) => [
      "I need a presentable AI governance report for the Board.",
      "",
      `- Quarter: ${s(args, "quarter")}`,
      `- AI systems in production: ${s(args, "ai_systems_count")}`,
      `- High-risk systems: ${s(args, "high_risk_count") || "TBD"}`,
      `- Open remediations: ${s(args, "open_remediations") || "TBD"}`,
      `- Context: ${s(args, "context_notes") || ""}`,
      "",
      "Load:",
      "- acf://framework/principle/P2 (traceability)",
      "- acf://framework/principle/P4 (proportional governance)",
      "- acf://framework/dimension/D5 (regulatory compliance)",
      "- acf://framework/dimension/D6 (audit & continuous improvement)",
      "",
      "Then produce a 1-page executive draft: portfolio health, criticality distribution (refer to acf://fiche/ACF-02), incidents + remediation status, regulatory delta (AI Act Annex III countdown), recommendations.",
    ].join("\n"),
  },
  {
    name: "acf.brief-ddao-mandate",
    description:
      "When you are about to deploy an autonomous AI agent and your CISO / DPO / Legal needs a signed mandate that documents the decision perimeter, the escalation thresholds, the kill switch and the audit trail — before go-live.",
    arguments: [
      { name: "agent_name", description: "Name of the agent.", required: true },
      { name: "agent_purpose", description: "What the agent does.", required: true },
      { name: "decision_perimeter", description: "Allowed and forbidden actions.", required: true },
      { name: "escalation_thresholds", description: "Escalation thresholds.", required: true },
    ],
    render: (args) => [
      "I need a signable DDAO mandate.",
      "",
      `- Agent name: ${s(args, "agent_name")}`,
      `- Purpose: ${s(args, "agent_purpose")}`,
      `- Decision perimeter: ${s(args, "decision_perimeter")}`,
      `- Escalation thresholds: ${s(args, "escalation_thresholds")}`,
      "",
      "Load:",
      "- acf://framework/ddao",
      "- acf://fiche/ACF-12 (mandate template)",
      "- acf://fiche/ACF-03 (constitution)",
      "- acf://fiche/ACF-07 (kill switch)",
      "- acf://fiche/ACF-09 (escalation thresholds)",
      "",
      "Then produce a mandate document in 7 sections (Identification, Decision perimeter, Forbidden actions, Escalation thresholds, Kill switch, Audit log, Doctrine version) ready for DDAO + DPO + CISO sign-off.",
    ].join("\n"),
  },
  {
    name: "acf.brief-classify-system",
    description:
      "When you receive an AI system to classify against the EU AI Act and you need a defensible qualification — Article 5 screening, Annex III check, Annex I check, GPAI test, conclusion with a justification that holds up to a regulator's challenge.",
    arguments: [
      { name: "system_description", description: "What the system does.", required: true },
      { name: "sector", description: "Sector of operation.", required: true },
      { name: "personal_data", description: "Does it process personal data?", required: false },
    ],
    render: (args) => [
      "I need a defensible AI Act qualification.",
      "",
      `- System: ${s(args, "system_description")}`,
      `- Sector: ${s(args, "sector")}`,
      `- Personal data: ${s(args, "personal_data") || "to confirm"}`,
      "",
      "Load:",
      "- acf://guide/ai-act",
      "- acf://fiche/ACF-02 (criticality)",
      "- acf://fiche/ACF-11 (risk assessment)",
      "",
      "Then run the canonical screening (Art. 5 prohibitions → Annex III → Annex I → GPAI test → transparency-only Art. 50) and conclude with a paragraph that lists the obligations and the operational consequences. If a tool would help, call acf.classify-agent with the structured input.",
    ].join("\n"),
  },
  {
    name: "acf.brief-teacher-case",
    description:
      "When you need to prepare a teaching case for a master's class, a bar school session or a CPD seminar — one calibrated to the ACF® V1.0 quality bar (named characters, precise legal refs, bold-answer bonus, 1-3 useful pages max) — get a ready-to-edit case generated from your angle.",
    arguments: [
      { name: "topic", description: "Pedagogical angle (e.g. 'mandate drafting').", required: true },
      { name: "audience", description: "Audience (e.g. 'L3 droit', 'EMBA').", required: true },
      { name: "duration_minutes", description: "Duration in minutes (15-180).", required: false },
    ],
    render: (args) => [
      "I need a calibrated ACF® V1.0 teaching case.",
      "",
      `- Topic: ${s(args, "topic")}`,
      `- Audience: ${s(args, "audience")}`,
      `- Duration: ${s(args, "duration_minutes") || "60"} minutes`,
      "",
      "Load:",
      "- acf://fiche/ACF-00 (introduction)",
      "- acf://framework/principle/P1",
      "- acf://framework/principle/P3",
      "",
      "Then produce a case study calibrated to the ACF® toolkit quality bar: named characters (avoid Marc/Marie), precise legal references (AI Act / GDPR / DORA articles), 1-3 page brief, 5 explicit deliverables, a teacher's correction guide. End with the ACF® doctrine citation.",
    ].join("\n"),
  },
];

const PROMPT_INDEX = new Map(ACF_PROMPTS.map((p) => [p.name, p]));

export function renderPrompt(name: string, args: Record<string, unknown>) {
  const prompt = PROMPT_INDEX.get(name);
  if (!prompt) throw new Error(`Unknown prompt: ${name}`);
  return {
    description: prompt.description,
    messages: [
      {
        role: "user" as const,
        content: { type: "text" as const, text: prompt.render(args) },
      },
    ],
  };
}

export async function registerPrompts(
  server: Server,
  _registry: AcfRegistry,
): Promise<void> {
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: ACF_PROMPTS.map((p) => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  }));
  server.setRequestHandler(GetPromptRequestSchema, async (req) => {
    return renderPrompt(req.params.name, req.params.arguments ?? {});
  });
}
