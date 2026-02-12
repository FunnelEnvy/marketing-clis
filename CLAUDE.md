# Marketing CLIs — Meta Repository

## Project Vision

This is a meta-repository that orchestrates the creation and maintenance of open source CLI tools for marketing platforms that lack them. Each marketing tool gets its own **standalone GitHub repo** for discoverability (easier to find via search), with cross-references back to this meta-repo. This repo contains:

1. **Registry** — index of all generated CLIs with status, links, and metadata
2. **Generator skill** — a Claude Code skill that creates new CLI repos from API documentation
3. **Shared libraries** — common auth, output formatting, config, and rate limiting patterns
4. **Templates** — repo scaffolding, CI/CD, docs, and release automation

All CLIs are Node.js (TypeScript) with single-binary distribution. Everything is MIT licensed.

## Agent Teams Strategy

This project is designed for Claude Code agent teams. The architecture naturally avoids file conflicts because each CLI is a separate repo in a sibling directory.

**Recommended workflow:**
1. **Lead agent** builds the meta-repo foundation (shared packages, template, generator skill) — this is sequential and must complete first
2. **Lead agent spawns 5 teammates**, one per CLI — each teammate owns an entire standalone repo directory and works independently
3. **Lead agent** monitors progress, synthesizes results, updates the meta-repo registry and README when teammates finish

**Why this works well for agent teams:**
- Zero file conflict risk — each teammate writes to its own `clis/{tool}-cli/` directory
- Each CLI is fully independent — no cross-teammate dependencies after shared packages are built
- Teammates can research APIs in parallel (the slowest part of CLI generation)
- Lead only needs to update `registry.json` and `README.md` in the meta-repo at the end

**Teammate spawn guidelines:**
- Each teammate prompt must include: tool name, API docs URL, auth method, priority endpoints, and the full path to create the repo
- Each teammate prompt must reference this CLAUDE.md for standards
- Teammates should be told NOT to modify anything in the meta-repo — only the lead does that
- Teammates should be told to use the shared packages from `shared/` as reference for patterns but to bundle/copy the code into their own repo

## Architecture

```
marketing_clis/                  # This meta-repo (GitHub: FunnelEnvy/marketing-clis)
├── CLAUDE.md                    # Claude Code instructions (this file)
├── README.md                    # Public-facing index — explains project, lists all CLIs
├── LICENSE                      # MIT
├── .envrc                       # CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
├── registry.json                # Machine-readable registry of all CLIs
├── generator/                   # The CLI generator skill
│   ├── SKILL.md                 # Claude Code skill definition
│   ├── templates/               # Scaffolding templates
│   │   └── node-cli/            # Node.js/TypeScript CLI template
│   ├── prompts/                 # Reusable prompt fragments
│   │   ├── api-discovery.md     # How to find and parse API specs
│   │   ├── cli-design.md        # CLI UX patterns and conventions
│   │   ├── auth-patterns.md     # OAuth2, API key, token patterns
│   │   └── testing.md           # Test generation patterns
│   └── examples/                # Reference implementations
├── shared/                      # Shared npm packages (bundled into CLIs at build)
│   ├── auth/                    # @funnelenvy/auth
│   ├── output/                  # @funnelenvy/output
│   ├── config/                  # @funnelenvy/config
│   └── rate-limit/              # @funnelenvy/rate-limit
└── clis/                        # CLI repos (gitignored, each has own git repo)
    ├── ga4-cli/
    ├── ahrefs-cli/
    ├── meta-ads-cli/
    ├── mailchimp-cli/
    └── buffer-cli/
```

Each CLI lives in the `clis/` directory as its own standalone git repo (gitignored by the meta-repo):
```
marketing_clis/
└── clis/
    ├── ga4-cli/           # standalone git repo
    ├── ahrefs-cli/        # standalone git repo
    ├── meta-ads-cli/      # standalone git repo
    ├── mailchimp-cli/     # standalone git repo
    └── buffer-cli/        # standalone git repo
```

## GitHub Repository Structure

### GitHub Organization
All repos live under a single GitHub org or user account. The meta-repo README is the "front door" for the project.

### Meta-Repo: `marketing-clis`
- GitHub repo name: `marketing-clis`
- Contains generator, shared libs, templates, registry
- README explains the project vision, lists all CLIs with install commands and status badges

### Individual CLI Repos
Each CLI is a **fully standalone** GitHub repo:
- Repo name: `{tool}-cli` (e.g., `ga4-cli`, `ahrefs-cli`, `meta-ads-cli`)
- Fully self-contained — anyone can clone and use without the meta-repo
- Shared packages are copied/bundled at build time, not external deps at runtime
- README links back to meta-repo: "Part of [Marketing CLIs](https://github.com/FunnelEnvy/marketing-clis) — open source CLIs for marketing tools."

### Git Init for Each Repo
Every repo (meta + each CLI) gets:
```bash
git init
git add .
git commit -m "Initial commit"
```

Every repo must have these files:
- `.gitignore` — node_modules, dist, .env, *.tgz, coverage/
- `LICENSE` — MIT, copyright "FunnelEnvy"
- `.github/workflows/ci.yml` — test on ubuntu/macos/windows, Node 20+
- `.github/workflows/release.yml` — publish to npm + GitHub Releases on tag push

## CLI Generation Workflow

When creating a new CLI, follow this sequence:

### Phase 1: API Discovery
1. Search for the tool's official API documentation URL
2. Check for OpenAPI/Swagger spec (check `/openapi.json`, `/swagger.json`, docs site)
3. If OpenAPI spec exists, fetch and save it as `api-spec.json` in the CLI repo
4. If no spec, read the REST API docs and build a command inventory:
   - List all endpoints grouped by resource (e.g., campaigns, contacts, reports)
   - Note auth method (API key, OAuth2, both)
   - Note rate limits
   - Note pagination patterns
   - Note response formats
5. Save the inventory as `api-inventory.md` in the CLI repo for reference

### Phase 2: CLI Design
1. Map API resources → CLI command groups (noun-based)
2. Map CRUD operations → subcommands (verb-based)
3. Design auth flow (config file + env var + flag)
4. Plan output formats (JSON default, table, CSV)
5. Write the command tree as a doc before writing any code
6. Prioritize: cover the most-used endpoints first, not every endpoint

### Phase 3: Scaffold & Implement
1. Create the CLI repo directory: `clis/{tool}-cli/`
2. Generate repo from the node-cli template
3. Implement auth module first
4. Implement commands resource-by-resource
5. Add `--output` / `-o` flag to every command
6. Add `--dry-run` where mutations exist
7. Add pagination handling for list commands (`--limit`, `--cursor`/`--page`)

### Phase 4: Quality & Docs
1. Generate tests — unit tests for command parsing and output formatting, integration test stubs with mocked HTTP responses (nock). **API keys may not be available, so all tests must work without live API access.**
2. Verify the CLI compiles and `--help` works for all commands
3. Write README (see README Standards below)
4. Write AGENTS.md for AI agent consumption
5. Add MIT LICENSE, .gitignore, CI workflows
6. `git init` and initial commit

## Validation Without API Keys

**Important:** API keys/credentials will not be available during generation. All validation must be structural:
- TypeScript compiles without errors (`tsc --noEmit`)
- `{tool} --help` runs and shows usage
- `{tool} <resource> --help` runs for each command group
- Unit tests pass (mocked HTTP, no live calls)
- Integration test stubs exist with nock fixtures and TODO comments for live testing
- `npm run build` succeeds
- `npm run lint` passes (eslint)

Do NOT attempt live API calls during generation. Structure tests so they can be run against live APIs later by swapping fixtures for real credentials via env vars.

## Standards for Generated CLIs

### Language & Tooling
- **Node.js (TypeScript)** with Commander.js — all CLIs, no exceptions
- Single-binary distribution via `pkg` or `bun compile`
- npm publish for standard `npx` / `npm install -g` install
- TypeScript strict mode
- ESM modules (`"type": "module"`)
- Node 20+ minimum

### Package Manager
- `pnpm` for the meta-repo (workspace support)
- `pnpm` for each CLI repo (consistency)

### Naming Convention
- npm package: `@funnelenvy/{tool}-cli`
- Binary name: `{tool}` (e.g., `ga4`, `ahrefs`, `meta-ads`, `mailchimp`, `buffer`)
- GitHub repo: `{tool}-cli`

### Command Structure
```
{tool} <resource> <action> [options]

Examples:
  ga4 properties list
  ga4 reports run --property 123456 --start-date 2024-01-01 --end-date 2024-01-31
  ahrefs backlinks list --target example.com --output csv
  meta-ads campaigns list --account-id act_123 --status ACTIVE
  mailchimp lists list --output table
  mailchimp campaigns send --campaign-id abc123 --dry-run
  buffer posts create --profile-id 123 --text "Hello world" --schedule "2024-03-01T09:00:00Z"
```

### Auth Pattern (Standardized)
Every CLI must support auth via (in priority order):
1. `--api-key` flag (for one-off use)
2. `{TOOL}_API_KEY` environment variable (e.g., `GA4_API_KEY`, `AHREFS_API_KEY`)
3. Config file at `~/.config/{tool}-cli/config.json`
4. Interactive `{tool} auth login` setup command

For OAuth2 tools (GA4, Meta Ads), implement localhost callback flow via `{tool} auth login`.

### Output Formatting (Standardized)
Every command that returns data must support:
- `--output json` / `-o json` (default) — machine-readable, pipe-friendly
- `--output table` / `-o table` — human-readable aligned columns
- `--output csv` / `-o csv` — for spreadsheet/data pipeline use
- `--quiet` / `-q` — suppress non-essential output (only data, no status messages)
- `--verbose` / `-v` — debug logging including HTTP requests

### Error Handling
- Exit code 0 for success, 1 for errors
- JSON mode: `{"error": {"code": "RATE_LIMITED", "message": "...", "retry_after": 30}}`
- Table mode: human-friendly message with suggested fix
- Rate limit errors: auto-retry with exponential backoff, show countdown in table mode
- Auth errors: clear message pointing to `{tool} auth login`

### Config File Format
```json
{
  "auth": {
    "api_key": "...",
    "oauth_token": "...",
    "oauth_refresh_token": "..."
  },
  "defaults": {
    "output": "table",
    "property_id": "123456"
  }
}
```

## README Standards

### Meta-Repo README
The meta-repo README should include:
- Project name and one-line description
- The "why" — marketing tools have APIs but no CLIs, which blocks automation and AI agents
- Table of all CLIs with: tool name, repo link, npm install command, status badge
- Brief explanation of standards (consistent auth, output, error handling across all CLIs)
- Contributing section — how to request a new CLI, how to build one using the generator
- License (MIT)

### Individual CLI READMEs
Each CLI README must follow this structure:
1. **Title & badges** — npm version, CI status, license
2. **One-liner** — what it does in one sentence
3. **Install** — `npm install -g @funnelenvy/{tool}-cli`
4. **Quick start** — 3-5 commands showing the most common workflows
5. **Authentication** — how to set up credentials (env var, config file, `auth login`)
6. **Command reference** — every command group with examples
7. **Output formats** — brief note about `--output json|table|csv`
8. **Configuration** — config file location and format
9. **Development** — clone, install, test, build
10. **Part of Marketing CLIs** — link back to meta-repo with brief explanation
11. **License** — MIT

### AGENTS.md
Each CLI must include an `AGENTS.md` for AI agent consumption:
- Structured command inventory (every command, required args, optional flags)
- Auth requirements and setup sequence
- Common multi-step workflows as command sequences
- Output format notes (what to expect from JSON output)
- Error codes and what they mean
- Rate limits and how to handle them

## Registry Format

`registry.json`:
```json
{
  "clis": [
    {
      "tool": "ga4",
      "name": "Google Analytics 4 CLI",
      "repo": "FunnelEnvy/ga4-cli",
      "package": "@funnelenvy/ga4-cli",
      "binary": "ga4",
      "status": "beta",
      "api_auth": "oauth2",
      "api_docs": "https://developers.google.com/analytics/devguides/reporting/data/v1",
      "commands": ["properties", "reports", "audiences", "events", "realtime"]
    }
  ]
}
```

## Target CLIs (First Batch)

### 1. ga4-cli — Google Analytics 4
- **API:** Google Analytics Data API v1, Admin API v1
- **Auth:** OAuth2 (Google Cloud project + OAuth consent screen) or service account
- **Key resources:** properties, reports (runReport, runRealtimeReport), audiences, dimensions, metrics
- **API docs:** https://developers.google.com/analytics/devguides/reporting/data/v1
- **Priority endpoints:** `properties list`, `reports run`, `realtime run`, `dimensions list`, `metrics list`

### 2. ahrefs-cli — Ahrefs
- **API:** Ahrefs API v3 (REST)
- **Auth:** API key (bearer token)
- **Key resources:** backlinks, organic keywords, referring domains, site explorer, domain rating
- **API docs:** https://docs.ahrefs.com/
- **Priority endpoints:** `backlinks list`, `keywords organic`, `domains referring`, `site-explorer overview`

### 3. meta-ads-cli — Meta/Facebook Ads
- **API:** Meta Marketing API (Graph API)
- **Auth:** OAuth2 (Meta app + access token). Long-lived tokens via `auth login`.
- **Key resources:** campaigns, ad sets, ads, ad accounts, insights (reporting), audiences
- **API docs:** https://developers.facebook.com/docs/marketing-apis/
- **Priority endpoints:** `campaigns list/create/update`, `adsets list/create`, `insights get`, `audiences list`

### 4. mailchimp-cli — Mailchimp
- **API:** Mailchimp Marketing API v3 (REST)
- **Auth:** API key (includes datacenter suffix, e.g., `key-us21`)
- **Key resources:** lists (audiences), campaigns, members (subscribers), templates, automations, reports
- **API docs:** https://mailchimp.com/developer/marketing/api/
- **Priority endpoints:** `lists list`, `members list/add/update`, `campaigns list/create/send`, `reports get`

### 5. buffer-cli — Buffer
- **API:** Buffer API v1 (REST)
- **Auth:** OAuth2 access token
- **Key resources:** profiles, posts (updates), schedules, analytics
- **API docs:** https://buffer.com/developers/api
- **Priority endpoints:** `profiles list`, `posts create/list`, `posts schedule`, `analytics get`

## Development Conventions

- `pnpm` as package manager everywhere
- pnpm workspaces in meta-repo for shared packages
- Each CLI repo is standalone with its own pnpm lockfile
- Shared packages bundled into each CLI at build time via tsup or similar
- ESM modules throughout
- vitest for testing
- eslint + prettier for code quality
- Node 20+ minimum target
- MIT license for everything
