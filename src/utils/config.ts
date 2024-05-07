import yaml from 'js-yaml';
import fs from 'node:fs';

export interface EnvironmentConfig {
  apiKey: string;
  domain: string;
  workspaceId: string;
}

export interface Config {
  default?: string;
  environments: Record<string, EnvironmentConfig>;
}

const configFile = './config.yml';

export function readConfig(): Config {
  if (!fs.existsSync(configFile)) {
    throw new Error(`Configuration file not found: ${configFile}`);
  }

  return yaml.load(fs.readFileSync(configFile, 'utf8')) as Config;
}

export function getEnvironment(env: string): EnvironmentConfig {
  const config = readConfig();
  if (!config.environments[env]) {
    throw new Error(`Environment "${env}" not found in config`);
  }

  return config.environments[env];
}

export function getDefaultEnvironment() {
  const config = readConfig();
  return config.default ? config.environments[config.default] : undefined;
}

export function setDefaultEnvironment(env: string): void {
  const config = readConfig();
  if (!config.environments[env]) {
    throw new Error(`Environment "${env}" not found in config`);
  }

  config.default = env;
  fs.writeFileSync(configFile, yaml.dump(config));
}
