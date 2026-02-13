# {{TOOL_DISPLAY_NAME}} CLI

[![npm version](https://img.shields.io/npm/v/@funnelenvy/{{TOOL_NAME}}-cli.svg)](https://www.npmjs.com/package/@funnelenvy/{{TOOL_NAME}}-cli)
[![CI](https://github.com/FunnelEnvy/{{TOOL_NAME}}-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/FunnelEnvy/{{TOOL_NAME}}-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

{{TOOL_DESCRIPTION}}

## Install

```bash
npm install -g @funnelenvy/{{TOOL_NAME}}-cli
```

## Quick Start

```bash
# Set up authentication
{{BINARY_NAME}} auth login

# {{QUICK_START_EXAMPLES}}
```

## Authentication

{{AUTH_SECTION}}

### Priority Order

1. `--api-key` flag
2. `{{ENV_PREFIX}}_API_KEY` environment variable
3. Config file at `~/.config/{{BINARY_NAME}}-cli/config.json`
4. Interactive `{{BINARY_NAME}} auth login`

## Command Reference

{{COMMAND_REFERENCE}}

## Output Formats

All commands support `--output` / `-o` with these formats:

- `json` (default) — machine-readable, pipe-friendly
- `table` — human-readable aligned columns
- `csv` — for spreadsheets and data pipelines

## Configuration

Config file location: `~/.config/{{BINARY_NAME}}-cli/config.json`

```json
{
  "auth": {
    "api_key": "your-api-key"
  },
  "defaults": {
    "output": "table"
  }
}
```

## Development

```bash
git clone https://github.com/FunnelEnvy/{{TOOL_NAME}}-cli.git
cd {{TOOL_NAME}}-cli
pnpm install
pnpm run build
pnpm run test
```

## Part of Marketing CLIs

This tool is part of [Marketing CLIs](https://github.com/FunnelEnvy/marketing-clis) — open source CLIs for marketing tools that don't have them.

## License

MIT
