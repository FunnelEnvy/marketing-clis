---
description: Generate a complete CLI tool for a marketing platform from its API documentation. Use when adding a new marketing tool CLI to the project.
---

# Generate a Marketing CLI

Generate a complete CLI tool for a marketing platform from its API documentation.

## Usage

```
/generate-cli <tool-name> <api-docs-url>
```

Examples:
```
/generate-cli hubspot https://developers.hubspot.com/docs/api/overview
/generate-cli sendgrid https://docs.sendgrid.com/api-reference
```

## Arguments

The user must provide:
- **tool-name** — lowercase name for the CLI (e.g., `hubspot`, `sendgrid`). Becomes the binary name, repo name (`{tool}-cli`), and npm package (`@funnelenvy/{tool}-cli`).
- **api-docs-url** — URL to the platform's REST API documentation.

If either is missing, ask for it before proceeding.

## Workflow

Follow all four phases in order. Read `CLAUDE.md` at the repo root for the full standards — it is the source of truth for naming, auth patterns, output formatting, error handling, and file structure.

### Phase 1: API Discovery

1. Fetch and read the API docs at the provided URL
2. Check for an OpenAPI/Swagger spec (`/openapi.json`, `/swagger.json`)
3. If a spec exists, save it as `api-spec.json` in the CLI repo
4. Build an endpoint inventory:
   - Group endpoints by resource (campaigns, contacts, reports, etc.)
   - Note the auth method (API key, OAuth2, both)
   - Note rate limits and pagination patterns
   - Note response envelope format
5. Save the inventory as `api-inventory.md` in the CLI repo

Reference: `prompts/api-discovery.md`

### Phase 2: CLI Design

1. Map API resources to command groups (nouns): `campaigns`, `lists`, `reports`
2. Map CRUD operations to subcommands (verbs): `list`, `get`, `create`, `update`, `delete`
3. Design the auth flow: `--api-key` flag > env var > config file > interactive login
4. Plan output: JSON (default), table, CSV for all data commands
5. Write the command tree and present it to the user before writing code
6. Prioritize the most-used endpoints — don't try to cover every endpoint

Reference: `prompts/cli-design.md`, `generator/prompts/auth-patterns.md`

### Phase 3: Scaffold & Implement

1. Create the CLI repo at `clis/{tool}-cli/`
2. Copy the template from `templates/node-cli/` and replace placeholders:
   - `{{TOOL_NAME}}` — lowercase tool name (e.g., `hubspot`)
   - `{{BINARY_NAME}}` — CLI binary name (e.g., `hubspot`)
   - `{{TOOL_DISPLAY_NAME}}` — display name (e.g., `HubSpot`)
   - `{{TOOL_DESCRIPTION}}` — one-line description
   - `{{ENV_PREFIX}}` — uppercase env var prefix (e.g., `HUBSPOT`)
   - `{{API_BASE_URL}}` — API base URL
3. Implement the auth module first
4. Implement commands resource by resource
5. Add `--output` / `-o`, `--quiet` / `-q`, `--verbose` / `-v` to every command
6. Add `--dry-run` to all mutation commands
7. Add pagination (`--limit`, `--cursor`/`--page`) to list commands

### Phase 4: Quality & Docs

1. Write tests with nock (mocked HTTP — no live API calls)
2. Verify: `pnpm run build`, `pnpm run typecheck`, `{tool} --help` works
3. Write README following the structure in `CLAUDE.md` (README Standards section)
4. Write `AGENTS.md` with full command inventory for AI agent consumption
5. Write `CLAUDE.md` that points to AGENTS.md: `@AGENTS.md`
6. Add LICENSE (MIT), .gitignore, CI workflows
7. `git init` and initial commit
8. Update `registry.json` in the meta-repo root to include the new CLI

Reference: `prompts/testing.md`

## Post-Generation Checklist

Before marking the CLI as done, verify:
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run test` — all tests pass
- [ ] `{tool} --help` shows usage
- [ ] `{tool} <resource> --help` works for each command group
- [ ] README has install, quick start, auth, command reference, and output format sections
- [ ] AGENTS.md has complete command inventory
- [ ] `registry.json` updated in meta-repo
