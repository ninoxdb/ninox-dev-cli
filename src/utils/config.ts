import yaml from 'js-yaml';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface EnvironmentConfig {
  apiKey: string;
  domain: string;
  workspaceId: string;
}

export interface Config {
  default?: string;
  environments: Record<string, EnvironmentConfig>;
}

// const configFile = './config.yml';
const CREDENTIALS_FILE_NAME = 'config.yaml';
const configFile = path.join(process.cwd(), CREDENTIALS_FILE_NAME);


export function readConfig(): Config {
  if (!fs.existsSync(configFile)) {
    throw new Error(`Configuration file not found: ${configFile}`);
  }

  return yaml.load(fs.readFileSync(configFile, 'utf8')) as Config;
}

export function getEnvironment(env: string): EnvironmentConfig {
  const config = readConfig();
  if (!config.environments[env]) {
    throw new Error(`Environment "${env}" not found in config\nUsage: ninox <environment> <command>\ne.g: ninox dev list`);
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
    throw new Error(`Environment "${env}" not found in config\n Usage: ninox <environment> <command>`);
  }

  config.default = env;
  fs.writeFileSync(configFile, yaml.dump(config));
}
