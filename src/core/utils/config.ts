import * as yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'

import {CREDENTIALS_FILE_NAME} from '../common/constants.js'
import {Config, EnvironmentConfig} from '../common/types.js'
import {configSchema} from './config-validator.js'

const configFile = path.join(process.cwd(), CREDENTIALS_FILE_NAME)

export function readConfig(): Config {
  if (!fs.existsSync(configFile)) {
    throw new Error(`Configuration file not found: ${configFile}`)
  }

  return yaml.load(fs.readFileSync(configFile, 'utf8')) as Config
}

export function getEnvironment(environment: string): EnvironmentConfig {
  const config = readConfig()

  // Validate the configuration
  const result = configSchema.safeParse(config)

  if (!result.success) {
    throw new Error(`Invalid configuration file: ${result.error}`)
  }

  if (!config.environments[environment]) {
    throw new Error(
      `Environment "${environment}" not found in config\nUsage: ninox <environment> <command>\ne.g: ninox dev database list`,
    )
  }

  return config.environments[environment]
}
