import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigManager } from '../index.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('ConfigManager', () => {
  let tempDir: string;
  let manager: ConfigManager;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'config-test-'));
    manager = new ConfigManager({
      toolName: 'test-tool',
      configDir: tempDir,
    });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns empty config when no file exists', () => {
    expect(manager.read()).toEqual({});
  });

  it('writes and reads config', () => {
    const config = {
      auth: { api_key: 'test-key-123' },
      defaults: { output: 'table' },
    };
    manager.write(config);
    expect(manager.read()).toEqual(config);
  });

  it('gets a specific key', () => {
    manager.write({ auth: { api_key: 'my-key' } });
    expect(manager.get('auth')).toEqual({ api_key: 'my-key' });
  });

  it('sets a specific key', () => {
    manager.set('auth', { api_key: 'new-key' });
    expect(manager.read().auth?.api_key).toBe('new-key');
  });

  it('gets and sets defaults', () => {
    manager.setDefault('output', 'csv');
    expect(manager.getDefault('output')).toBe('csv');
  });

  it('clears config', () => {
    manager.write({ auth: { api_key: 'key' } });
    manager.clear();
    expect(manager.read()).toEqual({});
  });

  it('returns correct paths', () => {
    expect(manager.getConfigDir()).toBe(tempDir);
    expect(manager.getConfigPath()).toBe(join(tempDir, 'config.json'));
  });
});
