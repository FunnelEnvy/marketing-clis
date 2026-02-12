# CLI Generator Skill

Generate a complete CLI tool for a marketing platform from its API documentation.

## Trigger

Use this skill when creating a new CLI for a marketing tool. Invoke with the tool name and API docs URL.

## Workflow

### Phase 1: API Discovery

1. **Find API documentation** — Search for the tool's official REST API docs
2. **Check for OpenAPI spec** — Look for `/openapi.json`, `/swagger.json`, or API spec downloads
3. **If spec exists**, save as `api-spec.json` in the CLI repo
4. **If no spec**, manually inventory the API:
   - List all endpoints grouped by resource
   - Note auth method (API key, OAuth2, both)
   - Note rate limits and pagination patterns
   - Note request/response formats
5. **Save inventory** as `api-inventory.md`

### Phase 2: CLI Design

1. **Map resources to command groups** (nouns): `campaigns`, `lists`, `reports`
2. **Map operations to subcommands** (verbs): `list`, `get`, `create`, `update`, `delete`
3. **Design auth flow**: flag → env var → config file → interactive login
4. **Plan output**: JSON (default), table, CSV for all data commands
5. **Document the command tree** before writing code
6. **Prioritize**: Cover the most-used endpoints first

### Phase 3: Scaffold & Implement

1. **Copy template** from `generator/templates/node-cli/`
2. **Replace placeholders**: `{{TOOL_NAME}}`, `{{BINARY_NAME}}`, `{{ENV_PREFIX}}`, etc.
3. **Implement auth module** first
4. **Implement commands** resource by resource:
   - Each command constructs the real HTTP request
   - Parses the real API response shape
   - Formats output (JSON/table/CSV)
5. **Add flags**: `--output`, `--quiet`, `--verbose`, `--dry-run` (mutations), `--limit` (lists)
6. **Add pagination** handling for list commands

### Phase 4: Quality & Docs

1. **Write tests** with nock — realistic mock responses, no live API calls
2. **Verify**: `tsc --noEmit`, `pnpm build`, `{tool} --help`
3. **Write README** following the template structure
4. **Write AGENTS.md** with full command inventory
5. **Add CI workflows**, LICENSE, .gitignore
6. **Git init** with initial commit

## Reference Files

- Template: `generator/templates/node-cli/`
- Shared patterns: `shared/auth/`, `shared/output/`, `shared/config/`, `shared/rate-limit/`
- Standards: `CLAUDE.md` (root of meta-repo)
- Prompt fragments: `generator/prompts/`

## Placeholder Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{TOOL_NAME}}` | `mailchimp` | Lowercase tool name, used in package name |
| `{{BINARY_NAME}}` | `mailchimp` | CLI binary name |
| `{{TOOL_DISPLAY_NAME}}` | `Mailchimp` | Display name for docs |
| `{{TOOL_DESCRIPTION}}` | `CLI for the Mailchimp Marketing API` | One-line description |
| `{{ENV_PREFIX}}` | `MAILCHIMP` | Uppercase prefix for env vars |
| `{{API_BASE_URL}}` | `https://us21.api.mailchimp.com/3.0` | API base URL |
