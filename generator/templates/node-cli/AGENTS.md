# {{TOOL_DISPLAY_NAME}} CLI — Agent Reference

## Command Inventory

{{COMMAND_INVENTORY}}

## Authentication

{{AUTH_SETUP_SEQUENCE}}

## Common Workflows

{{COMMON_WORKFLOWS}}

## Output Formats

All data commands accept `--output json|table|csv` (default: `json`).

JSON output structure:
- List commands return arrays: `[{...}, {...}]`
- Single resource commands return objects: `{...}`
- Errors return: `{"error": {"code": "ERROR_CODE", "message": "..."}}`

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `AUTH_MISSING` | No API key found | Run `{{BINARY_NAME}} auth login` |
| `AUTH_FAILED` | Invalid or expired key | Check key or re-authenticate |
| `RATE_LIMITED` | Too many requests | Wait for `retry_after` seconds |
| `NOT_FOUND` | Resource doesn't exist | Check the ID/name |
| `API_ERROR` | General API error | Check error message |

## Rate Limits

{{RATE_LIMIT_INFO}}

Auto-retry is built in with exponential backoff. Rate limit errors include a `retry_after` field in JSON output.
