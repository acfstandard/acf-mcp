import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ContentLoader } from "./content";
import { RulesLoader } from "./rules-loader";
import { SearchEngine } from "./search";
import { AcfRegistry } from "./registry";
import { registerResources } from "./resources";
import { registerTools } from "./tools";
import { registerPrompts } from "./prompts";

export interface CreateAcfServerOptions {
  contentRoot: string;
  rulesRoot: string;
  indexPath: string;
}

export const ACF_MCP_NAME = "acf-mcp";
export const ACF_MCP_VERSION = "1.0.2";

export async function createAcfServer(
  opts: CreateAcfServerOptions,
): Promise<{ server: Server; registry: AcfRegistry }> {
  const content = new ContentLoader({ contentRoot: opts.contentRoot });
  const rules = new RulesLoader({ rulesRoot: opts.rulesRoot });
  const search = await SearchEngine.fromFile(opts.indexPath);
  const meta = await content.loadMeta();

  const registry: AcfRegistry = { content, rules, search, meta };

  const server = new Server(
    { name: ACF_MCP_NAME, version: ACF_MCP_VERSION },
    {
      capabilities: {
        resources: { listChanged: false, subscribe: false },
        tools: { listChanged: false },
        prompts: { listChanged: false },
      },
    },
  );

  await registerResources(server, registry);
  await registerTools(server, registry);
  await registerPrompts(server, registry);

  return { server, registry };
}
