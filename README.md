# Marketing CLIs

Open source command-line tools for marketing platforms that don't have them.

## Why?

Marketing tools like Google Analytics, Ahrefs, Meta Ads, Mailchimp, and Buffer all have powerful APIs — but no official CLIs. This means marketers and developers can't easily automate workflows, pipe data between tools, or integrate with AI agents from the terminal.

Marketing CLIs fixes this by providing a consistent, high-quality CLI for each platform with standardized auth, output formats, and error handling.

## CLIs

| Tool | Install | Commands | Status |
|------|---------|----------|--------|
| [ga4-cli](https://github.com/FunnelEnvy/ga4-cli) — Google Analytics 4 | `npm i -g @funnelenvy/ga4-cli` | `properties` `reports` `realtime` `dimensions` `metrics` | Beta |
| [ahrefs-cli](https://github.com/FunnelEnvy/ahrefs-cli) — Ahrefs SEO | `npm i -g @funnelenvy/ahrefs-cli` | `backlinks` `keywords` `domains` `site-explorer` `domain-rating` | Beta |
| [meta-ads-cli](https://github.com/FunnelEnvy/meta-ads-cli) — Meta/Facebook Ads | `npm i -g @funnelenvy/meta-ads-cli` | `accounts` `campaigns` `adsets` `ads` `insights` `audiences` | Beta |
| [mailchimp-cli](https://github.com/FunnelEnvy/mailchimp-cli) — Mailchimp | `npm i -g @funnelenvy/mailchimp-cli` | `lists` `members` `campaigns` `templates` `reports` `automations` | Beta |
| [buffer-cli](https://github.com/FunnelEnvy/buffer-cli) — Buffer | `npm i -g @funnelenvy/buffer-cli` | `profiles` `posts` `analytics` | Beta |

## Standards

Every CLI follows the same conventions:

- **Auth:** `--api-key` flag, `{TOOL}_API_KEY` env var, `~/.config/{tool}-cli/config.json`, or interactive `{tool} auth login`
- **Output:** `--output json` (default), `--output table`, `--output csv`
- **Errors:** Structured JSON errors with codes, human-friendly messages in table mode, auto-retry on rate limits
- **Commands:** `{tool} <resource> <action> [options]` (noun-verb pattern)

## Architecture

This meta-repo contains the shared foundation:

```
marketing_clis/
├── .claude/skills/  # Claude Code skills (invoke with /generate-cli)
├── shared/          # Shared packages (auth, output, config, rate-limit)
├── generator/       # Templates and prompt fragments for CLI generation
├── registry.json    # Machine-readable index of all CLIs
└── clis/            # CLI repos (gitignored, each has own git repo)
```

Each CLI is a fully standalone repo that can be cloned and used independently.

## Generating a New CLI

This repo includes a Claude Code skill that automates the full CLI creation workflow. Open the repo in [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and run:

```
/generate-cli <tool-name> <api-docs-url>
```

For example:

```
/generate-cli hubspot https://developers.hubspot.com/docs/api/overview
```

The skill walks through four phases — API discovery, CLI design, scaffold & implement, quality & docs — and produces a complete, tested CLI repo in `clis/{tool}-cli/` ready for `git push` and `npm publish`.

For batch generation (multiple CLIs at once), see the Agent Teams Strategy in `CLAUDE.md`.

## Contributing

### Request a new CLI

Open an issue describing the marketing tool, its API, and the most important commands.

### Build a new CLI

1. Open this repo in Claude Code and run `/generate-cli <tool> <api-docs-url>`
2. Or manually: use `generator/templates/node-cli/` as your scaffold, follow `CLAUDE.md`
3. Submit a PR to add your CLI to `registry.json`

## License

MIT
