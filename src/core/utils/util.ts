import fs from 'node:fs'
import path from 'node:path'
import table from 'tty-table'
import * as yaml from 'yaml'

import {CREDENTIALS_FILE_NAME} from '../common/constants.js'
import {DatabaseMetadata} from '../common/schema-validators.js'
import {Config, EnvironmentConfig} from '../common/types.js'
import {configSchema} from './config-validator.js'

const configFile = path.join(process.cwd(), CREDENTIALS_FILE_NAME)

export function readConfig(): Config {
  if (!fs.existsSync(configFile)) {
    throw new Error(`Configuration file not found: ${configFile}`)
  }

  return yaml.parse(fs.readFileSync(configFile, 'utf8')) as Config
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

export const isTest = (): boolean => process.env.NODE_ENV === 'test'

export const renderDatabaseListAsTable = (data: DatabaseMetadata[]): string => {
  const header = [
    {alias: '#', value: 'idx'},
    {alias: 'Database name', align: 'left', headerAlign: 'left', value: 'name', width: 20},
    {alias: 'Database ID', value: 'id'},
  ]
  const rows = data.map((database, index) => ({...database, idx: index + 1}))
  const options = {
    borderColor: 'green',
    borderStyle: 'solid',
  }
  return table(header, rows, [], options).render()
}
