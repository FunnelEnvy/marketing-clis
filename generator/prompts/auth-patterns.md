# Auth Patterns

## API Key Authentication

Used by: Ahrefs, Mailchimp

### Resolution Order
1. `--api-key` flag (highest priority)
2. `{TOOL}_API_KEY` environment variable
3. Config file at `~/.config/{tool}-cli/config.json`
4. Interactive `{tool} auth login` (prompts and saves to config)

### Implementation

```typescript
// auth.ts
export function requireApiKey(flagValue?: string): string {
  const key = flagValue
    ?? process.env['{TOOL}_API_KEY']
    ?? config.read().auth?.api_key;

  if (!key) {
    console.error('No API key found. Run: {tool} auth login');
    process.exit(1);
  }
  return key;
}
```

### Auth Login Command

```typescript
// commands/auth.ts
auth.command('login')
  .description('Save API key to config')
  .action(async () => {
    // Read from stdin or prompt
    const key = await prompt('Enter your API key: ');
    config.set('auth', { api_key: key });
    console.log('API key saved to ~/.config/{tool}-cli/config.json');
  });
```

## OAuth2 Authentication

Used by: GA4, Meta Ads, Buffer

### Flow
1. User runs `{tool} auth login`
2. CLI starts local HTTP server on port 8484
3. Opens browser to OAuth consent URL
4. User authorizes, callback redirects to localhost with auth code
5. CLI exchanges code for access + refresh tokens
6. Tokens saved to config file
7. On subsequent requests, check expiry and refresh if needed

### Token Refresh

```typescript
export async function getValidToken(): Promise<string> {
  const auth = config.get('auth');
  if (!auth?.oauth_token) throw new Error('Not logged in');

  if (isExpired(auth.oauth_expires_at)) {
    const tokens = await refreshToken(auth.oauth_refresh_token);
    config.set('auth', { ...auth, ...tokens });
    return tokens.oauth_token;
  }
  return auth.oauth_token;
}
```
