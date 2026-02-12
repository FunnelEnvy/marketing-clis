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
├── shared/          # Shared packages (auth, output, config, rate-limit)
├── generator/       # CLI generator skill and templates
├── registry.json    # Machine-readable index of all CLIs
└── clis/            # CLI repos (gitignored, each has own git repo)
```

Each CLI is a fully standalone repo that can be cloned and used independently.

## Contributing

### Request a new CLI

Open an issue describing the marketing tool, its API, and the most important commands.

### Build a new CLI

1. Check the generator skill in `generator/SKILL.md` for the full workflow
2. Use `generator/templates/node-cli/` as your starting scaffold
3. Follow the standards in `CLAUDE.md`
4. Submit a PR to add your CLI to `registry.json`

## License

MIT
