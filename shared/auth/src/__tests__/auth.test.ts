import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveApiKey, requireApiKey, isTokenExpired, AuthError } from '../index.js';

describe('resolveApiKey', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns flag value first', () => {
    process.env['TEST_API_KEY'] = 'env-key';
    const result = resolveApiKey({
      flagValue: 'flag-key',
      envVar: 'TEST_API_KEY',
      configAuth: { api_key: 'config-key' },
    });
    expect(result).toBe('flag-key');
  });

  it('returns env value when no flag', () => {
    process.env['TEST_API_KEY'] = 'env-key';
    const result = resolveApiKey({
      envVar: 'TEST_API_KEY',
      configAuth: { api_key: 'config-key' },
    });
    expect(result).toBe('env-key');
  });

  it('returns config value when no flag or env', () => {
    const result = resolveApiKey({
      envVar: 'TEST_API_KEY',
      configAuth: { api_key: 'config-key' },
    });
    expect(result).toBe('config-key');
  });

  it('returns undefined when nothing set', () => {
    const result = resolveApiKey({
      envVar: 'TEST_API_KEY',
    });
    expect(result).toBeUndefined();
  });
});

describe('requireApiKey', () => {
  it('throws AuthError when no key found', () => {
    expect(() =>
      requireApiKey({
        envVar: 'NONEXISTENT_KEY',
        toolName: 'test',
      }),
    ).toThrow(AuthError);
  });

  it('returns key when found', () => {
    const key = requireApiKey({
      flagValue: 'my-key',
      envVar: 'TEST_KEY',
      toolName: 'test',
    });
    expect(key).toBe('my-key');
  });
});

describe('isTokenExpired', () => {
  it('returns false when no expiry', () => {
    expect(isTokenExpired()).toBe(false);
  });

  it('returns true when expired', () => {
    expect(isTokenExpired(Date.now() - 1000)).toBe(true);
  });

  it('returns false when not expired', () => {
    expect(isTokenExpired(Date.now() + 60000)).toBe(false);
  });
});
