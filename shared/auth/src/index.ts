import { createServer } from 'node:http';
import { URL } from 'node:url';

export interface AuthConfig {
  api_key?: string;
  oauth_token?: string;
  oauth_refresh_token?: string;
  oauth_expires_at?: number;
  service_account_key_path?: string;
}

export interface ResolveAuthOptions {
  /** Value from --api-key flag */
  flagValue?: string;
  /** Environment variable name (e.g. AHREFS_API_KEY) */
  envVar: string;
  /** Auth config from config file */
  configAuth?: AuthConfig;
}

/**
 * Resolves API key from flag > env > config (in priority order).
 * Returns undefined if no key found.
 */
export function resolveApiKey(options: ResolveAuthOptions): string | undefined {
  if (options.flagValue) return options.flagValue;
  const envVal = process.env[options.envVar];
  if (envVal) return envVal;
  return options.configAuth?.api_key;
}

/**
 * Resolves API key or throws with a helpful error message.
 */
export function requireApiKey(options: ResolveAuthOptions & { toolName: string }): string {
  const key = resolveApiKey(options);
  if (!key) {
    throw new AuthError(
      `No API key found. Provide one via:\n` +
        `  1. --api-key flag\n` +
        `  2. ${options.envVar} environment variable\n` +
        `  3. ${options.toolName} auth login`,
      'AUTH_MISSING',
    );
  }
  return key;
}

/**
 * Resolves OAuth token from flag > env > config (in priority order).
 */
export function resolveOAuthToken(options: ResolveAuthOptions): string | undefined {
  if (options.flagValue) return options.flagValue;
  const envVal = process.env[options.envVar];
  if (envVal) return envVal;
  return options.configAuth?.oauth_token;
}

/**
 * Checks if an OAuth token has expired.
 */
export function isTokenExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false;
  return Date.now() >= expiresAt;
}

export interface OAuthCallbackResult {
  code: string;
  state?: string;
}

export interface OAuthLocalServerOptions {
  port?: number;
  successMessage?: string;
}

/**
 * Starts a local HTTP server to receive OAuth callback.
 * Returns a promise that resolves with the authorization code.
 */
export function startOAuthCallbackServer(
  options: OAuthLocalServerOptions = {},
): Promise<OAuthCallbackResult> {
  const port = options.port ?? 8484;
  const successMessage =
    options.successMessage ?? 'Authorization successful! You can close this window.';

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      try {
        const url = new URL(req.url ?? '/', `http://localhost:${port}`);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state') ?? undefined;
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>Authorization failed: ${error}</h1></body></html>`);
          server.close();
          reject(new AuthError(`OAuth authorization failed: ${error}`, 'OAUTH_DENIED'));
          return;
        }

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Missing authorization code</h1></body></html>');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<html><body><h1>${successMessage}</h1></body></html>`);
        server.close();
        resolve({ code, state });
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(port, '127.0.0.1');
    server.on('error', reject);

    // Auto-close after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new AuthError('OAuth callback timed out after 5 minutes', 'OAUTH_TIMEOUT'));
    }, 5 * 60 * 1000);
  });
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
