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
  reports: string[]
  tables: string[]
  views: string[]
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

export interface ViewMetadata {
  caption: string
  id: string
  seq: number
  type: string
}

export type View = {
  caption: string
  config: ViewConfig
  id: string
  type: string
}

type ViewConfig = {
  cols: ViewColumn[]
  type: string
}

type ViewColumn = {
  agg: string | undefined
  aggType: ((agg: string, type: unknown) => unknown) | undefined
  caption: string | undefined
  conditionalStyling: unknown
  directFid: string | undefined
  expression: string
  filter: string | undefined
  width: number
}

// testing
type ConfigColumn = {
  caption?: string
  expression: string
  filter?: string
  width: number
}

type ViewConfigs = {
  cols: ConfigColumn[]
  descending: boolean
  group: number
  sort: number
  type: string
}

export type ViewType = {
  caption: string
  config: ViewConfigs
  id: string
  kanbanDisableCreate: boolean
  mode: string
  order: number
  seq: number
  type: string
}

export type ViewTypeFile = {
  view: {_database: string; _table: string} & ViewType
}

export type TableFolderContent = {
  reports: string[]
  table: string
  views: string[]
}
