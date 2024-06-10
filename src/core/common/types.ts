import {DatabaseSettingsType} from './schema-validators.js'

export interface NinoxCredentials {
  apiKey: string
  domain: string
  workspaceId: string
}
export interface Credentials {
  apiKey: string
  domain: string
  workspaceId: string
}
export interface DBConfigsYaml {
  database: string
  tables: string[]
}

export interface EnvironmentConfig {
  apiKey: string
  domain: string
  workspaceId: string
}

export interface Config {
  environments: Record<string, EnvironmentConfig>
}

export type DatabaseInfo = {
  id: string
  settings: DatabaseSettingsType
}
