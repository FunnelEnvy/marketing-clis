Read CLAUDE.md in this directory thoroughly — it contains the full project spec, architecture, standards, and target CLIs. Pay special attention to the "Agent Teams Strategy" section.

This is a two-phase job. You are the lead agent. Phase 1 is sequential foundation work that you do yourself. Phase 2 is parallel CLI generation using an agent team of 5 teammates.

---

## Phase 1: Build the Foundation (Lead Does This)

Complete these steps yourself before spawning any teammates. The teammates will depend on this work.

### 1a: Initialize the meta-repo

Set up this directory (`/Users/arun/dev/marketing_clis`) as the meta-repo:
- `pnpm init`, set up pnpm-workspace.yaml for shared packages
- Create the full directory structure from CLAUDE.md (generator/, shared/, clis/)
- Add MIT LICENSE (copyright "Marketing CLIs Contributors")
- Add .gitignore
- Write the meta-repo README.md per the README Standards in CLAUDE.md
- Create initial registry.json with all 5 CLIs in "planned" status

### 1b: Build shared packages

Create these packages under shared/ as pnpm workspace members:
- `shared/auth` — standardized auth (API key from flag/env/config, OAuth2 localhost callback flow, token storage and refresh)
- `shared/output` — output formatter (json, table via cli-table3, csv via csv-stringify)
- `shared/config` — config file management (~/.config/{tool}-cli/config.json pattern)
- `shared/rate-limit` — rate limit detection, exponential backoff, retry with countdown

Each shared package: TypeScript, ESM, proper package.json, exported types, unit tests with vitest. These are reference implementations that teammates will copy into their CLI repos.

### 1c: Build the node-cli template

Create `generator/templates/node-cli/` as a working scaffold with:
- package.json with standard deps (commander, chalk, conf, cli-table3, csv-stringify)
- tsconfig.json (strict, ESM), tsup.config.ts for bundling
- src/ scaffold: index.ts, auth.ts, commands/, lib/output.ts, lib/config.ts, lib/http.ts
- vitest.config.ts, .eslintrc, prettier config
- .github/workflows/ci.yml and release.yml
- .gitignore, LICENSE (MIT), README.md template, AGENTS.md template
- Placeholder variables ({{TOOL_NAME}}, {{BINARY_NAME}}, etc.) for customization

### 1d: Build the generator skill

Create `generator/SKILL.md` and the prompt fragments in `generator/prompts/`. The skill documents the full workflow for creating a CLI from an API.

### 1e: Git init the meta-repo

```bash
git init && git add . && git commit -m "Initial commit: meta-repo with shared packages, template, and generator"
```

---

## Phase 2: Spawn Agent Team for CLI Generation

Now create an agent team with 5 teammates. Each teammate builds one CLI in its own standalone repo directory. They work in parallel with zero file conflicts.

**Critical rules for teammates:**
- Each teammate ONLY writes to its own `/Users/arun/dev/{tool}-cli/` directory
- Teammates must NOT modify anything in `/Users/arun/dev/marketing_clis/`
- Each teammate should research the real API docs (use web search) for real endpoint shapes
- All commands must have real implementations (construct HTTP requests, parse responses, format output) — not placeholder stubs
- All tests use nock with realistic mock responses — no live API calls (no keys available)
- Each CLI must compile (`tsc --noEmit`), build, and show working `--help` output
- Each repo gets: git init, MIT LICENSE, full README, AGENTS.md, CI workflows, initial commit

Spawn these 5 teammates:

### Teammate 1: ga4-cli
```
Build the Google Analytics 4 CLI at /Users/arun/dev/ga4-cli/

Read /Users/arun/dev/marketing_clis/CLAUDE.md for all standards (auth, output, errors, naming, testing, README format, AGENTS.md).
Use /Users/arun/dev/marketing_clis/shared/ as reference for auth, output, config, and rate-limit patterns — copy the relevant code into your repo.
Use /Users/arun/dev/marketing_clis/generator/templates/node-cli/ as your starting scaffold.

API: Google Analytics Data API v1 + Admin API v1
Auth: OAuth2 (Google Cloud project) or service account JSON key
API docs: https://developers.google.com/analytics/devguides/reporting/data/v1
Priority commands: properties list, reports run, realtime run, dimensions list, metrics list

Research the real API docs to get actual endpoint URLs, request/response shapes, and auth headers.
Implement real commands, not stubs. Mock API responses in tests with nock.
Do NOT modify anything in /Users/arun/dev/marketing_clis/ — only write to /Users/arun/dev/ga4-cli/.
When done: git init, git add ., git commit -m "Initial commit: ga4-cli v0.1.0"
```

### Teammate 2: ahrefs-cli
```
Build the Ahrefs CLI at /Users/arun/dev/ahrefs-cli/

Read /Users/arun/dev/marketing_clis/CLAUDE.md for all standards.
Use /Users/arun/dev/marketing_clis/shared/ as reference for patterns — copy into your repo.
Use /Users/arun/dev/marketing_clis/generator/templates/node-cli/ as your starting scaffold.

API: Ahrefs API v3 (REST)
Auth: API key (bearer token)
API docs: https://docs.ahrefs.com/
Priority commands: backlinks list, keywords organic, domains referring, site-explorer overview, domain-rating get

Research the real API docs to get actual endpoint URLs, request/response shapes, and auth headers.
Implement real commands, not stubs. Mock API responses in tests with nock.
Do NOT modify anything in /Users/arun/dev/marketing_clis/ — only write to /Users/arun/dev/ahrefs-cli/.
When done: git init, git add ., git commit -m "Initial commit: ahrefs-cli v0.1.0"
```

### Teammate 3: meta-ads-cli
```
Build the Meta/Facebook Ads CLI at /Users/arun/dev/meta-ads-cli/

Read /Users/arun/dev/marketing_clis/CLAUDE.md for all standards.
Use /Users/arun/dev/marketing_clis/shared/ as reference for patterns — copy into your repo.
Use /Users/arun/dev/marketing_clis/generator/templates/node-cli/ as your starting scaffold.

API: Meta Marketing API (Graph API)
Auth: OAuth2 (Meta app + long-lived access token via auth login)
API docs: https://developers.facebook.com/docs/marketing-apis/
Priority commands: campaigns list/create/update, adsets list/create, ads list, insights get, audiences list, accounts list

Research the real API docs to get actual endpoint URLs, request/response shapes, and auth headers.
Implement real commands, not stubs. Mock API responses in tests with nock.
Do NOT modify anything in /Users/arun/dev/marketing_clis/ — only write to /Users/arun/dev/meta-ads-cli/.
When done: git init, git add ., git commit -m "Initial commit: meta-ads-cli v0.1.0"
```

### Teammate 4: mailchimp-cli
```
Build the Mailchimp CLI at /Users/arun/dev/mailchimp-cli/

Read /Users/arun/dev/marketing_clis/CLAUDE.md for all standards.
Use /Users/arun/dev/marketing_clis/shared/ as reference for patterns — copy into your repo.
Use /Users/arun/dev/marketing_clis/generator/templates/node-cli/ as your starting scaffold.

API: Mailchimp Marketing API v3 (REST)
Auth: API key (includes datacenter suffix, e.g. key-us21 — extract dc from key)
API docs: https://mailchimp.com/developer/marketing/api/
Priority commands: lists list, members list/add/update/delete, campaigns list/create/send, templates list, reports get, automations list

Research the real API docs to get actual endpoint URLs, request/response shapes, and auth headers.
Implement real commands, not stubs. Mock API responses in tests with nock.
Do NOT modify anything in /Users/arun/dev/marketing_clis/ — only write to /Users/arun/dev/mailchimp-cli/.
When done: git init, git add ., git commit -m "Initial commit: mailchimp-cli v0.1.0"
```

### Teammate 5: buffer-cli
```
Build the Buffer CLI at /Users/arun/dev/buffer-cli/

Read /Users/arun/dev/marketing_clis/CLAUDE.md for all standards.
Use /Users/arun/dev/marketing_clis/shared/ as reference for patterns — copy into your repo.
Use /Users/arun/dev/marketing_clis/generator/templates/node-cli/ as your starting scaffold.

API: Buffer API v1 (REST)
Auth: OAuth2 access token
API docs: https://buffer.com/developers/api
Priority commands: profiles list, posts create/list/update/delete, posts schedule, analytics get

Research the real API docs to get actual endpoint URLs, request/response shapes, and auth headers.
Implement real commands, not stubs. Mock API responses in tests with nock.
Do NOT modify anything in /Users/arun/dev/marketing_clis/ — only write to /Users/arun/dev/buffer-cli/.
When done: git init, git add ., git commit -m "Initial commit: buffer-cli v0.1.0"
```

---

## Phase 3: Lead Finalizes (After All Teammates Complete)

Once all 5 teammates have finished:

1. Create symlinks in `marketing_clis/clis/` pointing to each sibling CLI repo
2. Update `registry.json` — set all 5 CLIs to status "beta", fill in actual command lists
3. Update the meta-repo `README.md` with all 5 CLIs listed with install commands
4. Verify each CLI repo has a clean git history with initial commit
5. Spot-check: run `--help` on at least 2 CLIs to confirm they work
6. Commit the meta-repo updates: `git add . && git commit -m "Add 5 CLI repos to registry"`

---

## Important Notes

- Do NOT skip API research. Teammates must read real API docs so commands match real endpoints.
- Do NOT make placeholder "todo" commands. Each command should construct the right HTTP request, parse the real response shape, and format output.
- Tests must pass without API keys. Use nock with realistic mock responses.
- Quality over speed. This is the foundation for an open source project people will actually use.
- If a teammate gets stuck on an API that has poor documentation, it should implement what it can confidently and leave clear TODO comments for endpoints that need more research.
