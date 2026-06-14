# acf-mcp

**Official ACF® Model Context Protocol server.**
Agentic Commerce Framework® — first open governance standard for autonomous AI agents.

[ACF Standard](https://acfstandard.com) · [Compliance](https://acfstandard.com/compliance) · [Teaching toolkit](https://acfstandard.com/enseignants)

---

## What it does

`acf-mcp` exposes the ACF® doctrine — 4 principles, 4 autonomy levels, 6 maturity dimensions, the DDAO role, 17 methodological cards, 5 expert regulatory guides (AI Act, GDPR, DORA, NIS2, ISO 42001), the white paper and the glossary — as native MCP **Resources**, **Tools** and **Prompts** so any MCP client (Claude Desktop, Cursor, Windsurf, Continue…) can reason on top of it.

It also ships **7 deterministic REASON tools** (built on a versioned knowledge base — no internal LLM call) that take a user case and return a structured ACF® governance assessment:

- `acf.advisor` — generic case → structured advice (autonomy + risk + principles + fiches + first actions)
- `acf.classify-agent` — **killer tool**: 10-field qualified-enum input → preliminary qualification (ACF level + criticality + AI Act role + GDPR status + obligations by lifecycle + DDAO controls + sign-off requirements)
- `acf.assess-autonomy` — N0-N3 recommendation with go/no-go + gating + kill switch design
- `acf.identify-governance-gaps` — 6-dimension maturity score + prioritised remediation
- `acf.map-ai-act-obligations` — full obligation set structured by lifecycle phase (pre-go-live / continuous / on-incident) with Digital Omnibus deferrals
- `acf.assign-ddao-controls` — level × risk → recommended + ACF-canonical controls
- `acf.evaluate-agent-mandate` — 8-check audit of an existing mandate

Every REASON output is **signed**: `doctrine_version`, `doctrine_hash`, `doctrine_archive_url`, `regulatory_snapshot`, `generated_at`. Every REASON output is positioned as **preliminary qualification, not legal advice** — `requires_human_review: true` is constant in V1.0.

## Install (stdio)

```bash
# Claude Desktop, Cursor, Windsurf:
npx -y acf-mcp
```

Add to Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "acf": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "acf-mcp"]
    }
  }
}
```

No API key — V1.0 is open access (cf. `Position stratégique` in the spec).

## Discover & install

`acf-mcp` is a **local stdio server** — there is no hosted HTTP endpoint to configure; it runs on the client via `npx` (above). Find it through:

- **npm** — [`acf-mcp`](https://www.npmjs.com/package/acf-mcp)
- **MCP Registry** — `io.github.acfstandard/acf-mcp`
- **Smithery** — search `acf-mcp`

## Locales

V1.0 ships FR + EN translated. The 11 other locales (`es, de, pt, it, nl, ru, ar, tr, ja, zh, ko`) are infrastructure-supported but fallback to EN with `_meta.is_fallback: true` signalled. Full translation comes in V1.3 with native juristic review per jurisdiction.

## Doctrine traceability

Every REASON output embeds:
- `doctrine_version` — e.g. `"ACF framework v1.0 / rules 2026-06"`
- `doctrine_hash` — sha256 of the active content + rules at call time
- `doctrine_archive_url` — permanent archive of the doctrine version used
- `regulatory_snapshot` — corpus that was reasoned against
- `generated_at` — ISO 8601 timestamp

An audit can reconstruct the exact analysis produced at instant T by loading the archive URL.

## License

MIT. See `LICENSE`.

## Citation

```
Dorange, V. (2026). Agentic Commerce Framework® (ACF®). ACF Standard.
https://acfstandard.com
```

## Contributing

Issues + PRs welcome on https://github.com/acfstandard/acf-mcp. Developer documentation: https://acfstandard.io. Doctrine modifications go through the maintainer review process.
