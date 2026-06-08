import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createAcfServer, CreateAcfServerOptions } from "../core/server.js";

export type McpHttpOptions = CreateAcfServerOptions;

/**
 * Stateless HTTP MCP transport. Each POST is self-contained:
 *   - new transport per request,
 *   - new server per request (reuse is fine but stateless),
 *   - no session id allocated.
 *
 * Vercel serverless = stateless by design (lambda dies between invocations),
 * so any in-memory session map would be useless. Cf. spec §7.2.
 *
 * NOTE: The plan calls for StreamableHTTPServerTransport (streamableHttp.js),
 * but that class wraps IncomingMessage/ServerResponse (Node HTTP). For Web
 * Standard Request/Response (Next.js App Router, Vercel Edge / Node runtime),
 * WebStandardStreamableHTTPServerTransport (webStandardStreamableHttp.js) is
 * the correct choice — it accepts a Web Request and returns a Web Response.
 *
 * The SDK enforces that POST requests carry Accept: application/json, text/event-stream.
 * When enableJsonResponse is true we always return JSON, so we normalise the
 * Accept header on the incoming request before handing it to the transport.
 */
export async function handleMcpRequest(
  req: Request,
  opts: McpHttpOptions,
): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
    enableJsonResponse: true,
  });

  const { server } = await createAcfServer(opts);
  await server.connect(transport);

  // Normalise Accept header so the SDK's validation passes.
  // With enableJsonResponse: true we always respond with application/json,
  // but the spec still requires the client to signal acceptance of both.
  const accept = req.headers.get("accept") ?? "";
  const needsNormalise =
    !accept.includes("application/json") || !accept.includes("text/event-stream");
  const normalised = needsNormalise
    ? new Request(req, {
        headers: new Headers({
          ...Object.fromEntries(req.headers.entries()),
          accept: "application/json, text/event-stream",
        }),
      })
    : req;

  return transport.handleRequest(normalised);
}
