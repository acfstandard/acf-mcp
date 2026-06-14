# Changelog

## 1.0.4 — 2026-06-14

Repository moved from `aiconsulting06000-tech` to dedicated org `acfstandard`. The old URL keeps redirecting (GitHub 301) — existing clones and registry references stay alive.

- `repository.url` → `https://github.com/acfstandard/acf-mcp`
- `homepage` → `https://acfstandard.io` (new developer documentation site)
- `mcpName` → `io.github.acfstandard/acf-mcp` (registry identity aligned with the new repo location)
- `server.json` `name` + `websiteUrl` aligned. No source-level changes, same 245 tests.

## 1.0.3 — 2026-06-09

Full V1.0 doctrine content + cryptographic integrity. Shipped content grows from 51 to 74 files; the doctrine is now ed25519-signed and independently verifiable.

- **Content**: whitepaper (FR+EN), full manual (FR), deck, and 5 regulator guides — AI Act, GDPR, DORA, NIS2, ISO 42001 (FR+EN) — plus `regulation-articles.json`. `acf.regulation.article` now returns real article text + ACF® mappings (replaces the V1.0 placeholder stub).
- **Integrity**: `meta.json` carries `doctrine_signature` (ed25519) + `doctrine_public_key`; every REASON footer now exposes `doctrine_signature`. New scripts: `verify-doctrine`, `sign-doctrine`, `keygen:doctrine`. `verify-doctrine` re-checks `content_hash` and signature using the embedded public key alone — no private key required.
- **Reproducibility**: content hashing is now location-independent (paths hashed relative to root), so the `content_hash` is byte-reproducible across the monorepo and this mirror. `content_hash: sha256:aa8911fb…`.
- **Archive**: `build:archive` emits a self-verifying permanent bundle (`dist/archive/doctrine-v1.0.json` — 73 files, full content + per-file + aggregate hashes + signature).
- **Trademark**: "Souveraineté Agentique®" mark applied across content.
- **Validation**: `validate-content` strengthened (structural checks + negative fixtures). 245 tests.

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
