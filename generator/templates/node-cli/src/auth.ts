import { ConfigManager } from './lib/config.js';

const config = new ConfigManager('{{BINARY_NAME}}');

export interface AuthHeaders {
  [key: string]: string;
}

/**
 * Resolves the API key from flag > env > config.
 */
export function resolveApiKey(flagValue?: string): string | undefined {
  if (flagValue) return flagValue;
  const envVal = process.env['{{ENV_PREFIX}}_API_KEY'];
  if (envVal) return envVal;
  return config.read().auth?.api_key;
}

/**
 * Requires an API key or exits with an error.
 */
export function requireApiKey(flagValue?: string): string {
  const key = resolveApiKey(flagValue);
  if (!key) {
    console.error(
      `No API key found. Provide one via:\n` +
        `  1. --api-key flag\n` +
        `  2. {{ENV_PREFIX}}_API_KEY environment variable\n` +
        `  3. {{BINARY_NAME}} auth login`,
    );
    process.exit(1);
  }
  return key;
}

/**
 * Returns auth headers for API requests.
 */
export function getAuthHeaders(apiKey: string): AuthHeaders {
  return {
    Authorization: `Bearer ${apiKey}`,
  };
}
