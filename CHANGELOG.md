# Changelog

## 1.0.2 — 2026-06-08

Public mirror. Code moved from monorepo subfolder to dedicated public repository at https://github.com/aiconsulting06000-tech/acf-mcp. No functional change vs 1.0.1.

- `repository.url` updated to point to the new dedicated repository
- `homepage` + `bugs` fields added
- No source-level changes — same 219 tests, same 12 tools, same doctrine hash, same disclaimer

## 1.0.1 — 2026-06-08

MCP Registry preparation. Added `mcpName` field to package.json for ownership verification. No code change.

## 1.0.0 — 2026-06-07

Initial release. 12 tools (5 READ + 7 REASON, all canonically signed) + 34 Resources + 6 problem-first prompts. Stateless HTTP transport + npm-distributed stdio entry. Knowledge base externalised in `content/rules/*.json`. Lunr index pre-built at build time. Doctrine hash `sha256:a792ef25…`.

### Highlights

- `acf.classify-agent` — killer feature, 10-field qualified-enum input, full preliminary governance assessment in one call.
- `acf.advisor` — generic case → structured advice.
- 5 specialised REASON tools sharing the same engine.
- Canonical disclaimer + 4-field snapshot tests (CI-enforced).
- 4-tier rate limiting on HTTP.
- Log whitelist sanitization (no PII, ever).
- IP guardrails: validate-content script enforces "no INPI, no Decision Engine, no book mention".
