import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AcfRegistry } from "./registry";
import { TOOL_DESCRIPTIONS } from "../constants/tool-descriptions";
import {
  handleSearchTool, SearchInputSchema,
  handleFicheLookupTool, FicheLookupInputSchema,
  handleRegulationArticleTool, RegulationArticleInputSchema,
  handleGlossaryDefineTool, GlossaryDefineInputSchema,
  handleCiteTool, CiteInputSchema,
} from "./tools-read";
import { zodToJsonSchema } from "../lib/zod-to-json-schema";
import { handleClassifyAgentTool } from "./tool-classify-agent";
import { ClassifyAgentInputSchema } from "./classify-agent-input";
import { handleAdvisorTool, AdvisorInputSchema } from "./tool-advisor";
import { handleAssessAutonomyTool, AssessAutonomyInputSchema } from "./tool-assess-autonomy";
import { handleIdentifyGapsTool, IdentifyGapsInputSchema } from "./tool-identify-gaps";
import { handleMapObligationsTool, MapObligationsInputSchema } from "./tool-map-obligations";
import { handleAssignControlsTool, AssignControlsInputSchema } from "./tool-assign-controls";
import { handleEvaluateMandateTool, EvaluateMandateInputSchema } from "./tool-evaluate-mandate";

interface ToolHandler {
  name: string;
  description: string;
  inputSchema: object;
  handle: (registry: AcfRegistry, input: unknown) => Promise<unknown>;
}

const HANDLERS: ToolHandler[] = [
  {
    name: "acf.search",
    description: TOOL_DESCRIPTIONS["acf.search"],
    inputSchema: zodToJsonSchema(SearchInputSchema),
    handle: handleSearchTool,
  },
  {
    name: "acf.fiche.lookup",
    description: TOOL_DESCRIPTIONS["acf.fiche.lookup"],
    inputSchema: zodToJsonSchema(FicheLookupInputSchema),
    handle: handleFicheLookupTool,
  },
  {
    name: "acf.regulation.article",
    description: TOOL_DESCRIPTIONS["acf.regulation.article"],
    inputSchema: zodToJsonSchema(RegulationArticleInputSchema),
    handle: handleRegulationArticleTool,
  },
  {
    name: "acf.glossary.define",
    description: TOOL_DESCRIPTIONS["acf.glossary.define"],
    inputSchema: zodToJsonSchema(GlossaryDefineInputSchema),
    handle: handleGlossaryDefineTool,
  },
  {
    name: "acf.cite",
    description: TOOL_DESCRIPTIONS["acf.cite"],
    inputSchema: zodToJsonSchema(CiteInputSchema),
    handle: handleCiteTool,
  },
  {
    name: "acf.classify-agent",
    description: TOOL_DESCRIPTIONS["acf.classify-agent"],
    inputSchema: zodToJsonSchema(ClassifyAgentInputSchema),
    handle: handleClassifyAgentTool,
  },
  {
    name: "acf.advisor",
    description: TOOL_DESCRIPTIONS["acf.advisor"],
    inputSchema: zodToJsonSchema(AdvisorInputSchema),
    handle: handleAdvisorTool,
  },
  {
    name: "acf.assess-autonomy",
    description: TOOL_DESCRIPTIONS["acf.assess-autonomy"],
    inputSchema: zodToJsonSchema(AssessAutonomyInputSchema),
    handle: handleAssessAutonomyTool,
  },
  {
    name: "acf.identify-governance-gaps",
    description: TOOL_DESCRIPTIONS["acf.identify-governance-gaps"],
    inputSchema: zodToJsonSchema(IdentifyGapsInputSchema),
    handle: handleIdentifyGapsTool,
  },
  {
    name: "acf.map-ai-act-obligations",
    description: TOOL_DESCRIPTIONS["acf.map-ai-act-obligations"],
    inputSchema: zodToJsonSchema(MapObligationsInputSchema),
    handle: handleMapObligationsTool,
  },
  {
    name: "acf.assign-ddao-controls",
    description: TOOL_DESCRIPTIONS["acf.assign-ddao-controls"],
    inputSchema: zodToJsonSchema(AssignControlsInputSchema),
    handle: handleAssignControlsTool,
  },
  {
    name: "acf.evaluate-agent-mandate",
    description: TOOL_DESCRIPTIONS["acf.evaluate-agent-mandate"],
    inputSchema: zodToJsonSchema(EvaluateMandateInputSchema),
    handle: handleEvaluateMandateTool,
  },
];

export async function registerTools(
  server: Server,
  registry: AcfRegistry,
): Promise<void> {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: HANDLERS.map((h) => ({
      name: h.name,
      description: h.description,
      inputSchema: h.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const handler = HANDLERS.find((h) => h.name === req.params.name);
    if (!handler) {
      throw new Error(`Unknown tool: ${req.params.name}`);
    }
    const result = await handler.handle(registry, req.params.arguments ?? {});
    return {
      content: [
        { type: "text", text: JSON.stringify(result, null, 2) },
      ],
    };
  });
}

export { HANDLERS };
