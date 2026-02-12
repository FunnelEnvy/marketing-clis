import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface CliConfig {
  auth?: {
    api_key?: string;
    oauth_token?: string;
    oauth_refresh_token?: string;
    oauth_expires_at?: number;
  };
  defaults?: Record<string, string>;
}

export class ConfigManager {
  private configPath: string;
  private configDir: string;

  constructor(toolName: string) {
    this.configDir = join(homedir(), '.config', `${toolName}-cli`);
    this.configPath = join(this.configDir, 'config.json');
  }

  read(): CliConfig {
    if (!existsSync(this.configPath)) return {};
    try {
      return JSON.parse(readFileSync(this.configPath, 'utf-8'));
    } catch {
      return {};
    }
  }

  write(config: CliConfig): void {
    mkdirSync(this.configDir, { recursive: true });
    writeFileSync(this.configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  }

  get<K extends keyof CliConfig>(key: K): CliConfig[K] {
    return this.read()[key];
  }

  set<K extends keyof CliConfig>(key: K, value: CliConfig[K]): void {
    const config = this.read();
    config[key] = value;
    this.write(config);
  }
}
