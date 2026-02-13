# CLI Design Patterns

## Command Structure

Follow the noun-verb pattern:

```
{tool} <resource> <action> [options]
```

### Resource Mapping

Map API resources to CLI command groups:
- `/api/campaigns` → `{tool} campaigns`
- `/api/lists` → `{tool} lists`
- `/api/reports` → `{tool} reports`

### Action Mapping

Map CRUD operations to subcommands:
- `GET /resources` → `list`
- `GET /resources/:id` → `get`
- `POST /resources` → `create`
- `PUT/PATCH /resources/:id` → `update`
- `DELETE /resources/:id` → `delete`

Special actions keep descriptive names:
- `POST /campaigns/:id/send` → `send`
- `POST /reports/run` → `run`

## Standard Options

Every command should include:
- `-o, --output <format>` — json (default), table, csv
- `-q, --quiet` — suppress status messages
- `-v, --verbose` — debug logging

List commands add:
- `--limit <n>` — max results
- `--cursor <token>` or `--page <n>` — pagination

Mutation commands add:
- `--dry-run` — show what would happen without executing

Auth commands:
- `--api-key <key>` — API key for one-off use

## Command Implementation Pattern

```typescript
import { Command } from 'commander';
import { requireApiKey, getAuthHeaders } from '../auth.js';
import { request } from '../lib/http.js';
import { printOutput, printError } from '../lib/output.js';

export function registerCampaignsCommands(program: Command) {
  const campaigns = program
    .command('campaigns')
    .description('Manage campaigns');

  campaigns
    .command('list')
    .description('List all campaigns')
    .option('-o, --output <format>', 'Output format', 'json')
    .option('--limit <n>', 'Max results', '25')
    .option('--status <status>', 'Filter by status')
    .action(async (opts) => {
      try {
        const apiKey = requireApiKey(opts.apiKey);
        const data = await request('/campaigns', {
          headers: getAuthHeaders(apiKey),
        });
        printOutput(data, opts.output);
      } catch (error) {
        printError(error, opts.output);
        process.exit(1);
      }
    });
}
```
