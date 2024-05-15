import {z} from 'zod'

export const DatabaseSettings = z.object({
  backgroundClass: z.string().nullable().optional(),
  bgType: z.string().nullable().optional(),
  color: z.string(),
  icon: z.string(),
  name: z.string(),
  rolesExport: z.array(z.string()).optional(),
  rolesHistory: z.array(z.string()).optional(),
  rolesImport: z.array(z.string()).optional(),
  rolesMassDataUpdate: z.array(z.string()).optional(),
  rolesOpen: z.array(z.string()).optional(),
  rolesPrint: z.array(z.string()).optional(),
})

export const Database = z.object({
  id: z.string(),
  settings: DatabaseSettings,
})

export const DatabaseSchemaBase = z.object({
  afterOpen: z.union([z.string(), z.null()]).optional(),
  afterOpenBehavior: z.enum(['openHome', 'restoreNavigation']),
  compatibility: z.string(),
  dateFix: z.enum(['enabled', 'disabled']),
  fileSync: z.enum(['full', 'cached']),
  globalCode: z.union([z.string(), z.null()]).optional(),
  hideCalendar: z.boolean(),
  hideDatabase: z.boolean(),
  hideNavigation: z.boolean(),
  hideSearch: z.boolean(),
  knownDatabases: z
    .array(
      z.object({
        dbId: z.string(),
        name: z.string(),
        teamId: z.string(),
        teamName: z.string(),
      }),
    )
    .optional(),
  nextTypeId: z.number(),
  seq: z.number(),
  version: z.number(),
})

export const DatabaseSchema = DatabaseSchemaBase.extend({
  types: z.record(z.any()),
})

export const DatabaseSchemaInFile = DatabaseSchemaBase.extend({
  _database: z.string(), // Database ID for local reference
})

export const DatabaseFile = z.object({
  database: Database.extend({
    schema: DatabaseSchemaInFile,
  }),
})

export const TableBase = z.object({
  afterCreate: z.string().optional(),
  afterUpdate: z.string().optional(),
  canCreate: z.string().optional(),
  canDelete: z.string().optional(),
  canRead: z.string().optional(),
  canWrite: z.string().optional(),
  caption: z.string(),
  captions: z.record(z.any()),
  color: z.string().optional(),
  createRoles: z.array(z.string()).optional(),
  deleteRoles: z.array(z.string()).optional(),
  description: z.string().optional(),
  fields: z.record(z.any()),
  globalSearch: z.boolean(),
  hasComments: z.boolean().optional(),
  hasFiles: z.boolean().optional(),
  hasHistory: z.boolean().optional(),
  hidden: z.boolean(),
  icon: z.string().optional(),
  kind: z.enum(['table', 'page']),
  nextFieldId: z.number(),
  order: z.union([z.number(), z.null()]),
  readRoles: z.array(z.string()).optional(),
  uis: z.record(z.any()),
  uuid: z.string(),
  writeRoles: z.array(z.string()).optional(),
})

export const TableFile = z.object({
  table: TableBase.extend({
    _database: z.string(), // Database ID for local reference
    _id: z.string(), // key of the Schema.types object e.g A
  }),
})

export const DatabaseSchemaForUpload = z.object({
  afterOpen: z.union([z.string(), z.null()]).optional(),
  afterOpenBehavior: z.enum(['openHome', 'restoreNavigation']).optional(),
  compatibility: z.string().optional(),
  dateFix: z.enum(['enabled', 'disabled']).optional(),
  dbId: z.union([z.string(), z.null()]),
  dbName: z.union([z.string(), z.null()]),
  fileSync: z.enum(['full', 'cached']).optional(),
  globalCode: z.union([z.string(), z.null()]).optional(),
  hideCalendar: z.boolean().optional(),
  hideDatabase: z.boolean().optional(),
  hideNavigation: z.boolean().optional(),
  hideSearch: z.boolean().optional(),
  isProtected: z.boolean().optional(),
  knownDatabases: z
    .array(
      z.object({
        dbId: z.string(),
        name: z.string(),
        teamId: z.string(),
        teamName: z.string(),
      }),
    )
    .optional(),
  seq: z.number(),
  version: z.number(),
})

export const TableForUpload = z.object({
  _dateFields: z.record(z.any()).optional(),
  afterCreate: z.union([z.string(), z.null()]).optional(),
  afterUpdate: z.union([z.string(), z.null()]).optional(),
  background: z.any().optional(),
  caption: z.string(),
  captions: z.record(z.string()),
  children: z.union([z.array(z.any()), z.null()]).optional(),
  color: z.any().optional(),
  createRoles: z.union([z.array(z.string()), z.null()]).optional(),
  deleteRoles: z.union([z.array(z.string()), z.null()]).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  fields: z.record(z.any()),
  globalSearch: z.boolean(),
  hasComments: z.boolean().optional(),
  hasFiles: z.boolean().optional(),
  hasHistory: z.boolean().optional(),
  hidden: z.boolean(),
  icon: z.union([z.string(), z.null()]).optional(),
  id: z.string(),
  isNew: z.union([z.boolean(), z.null()]).optional(),
  kind: z.enum(['table', 'page']),
  master: z.any().optional(),
  masterRef: z.any().optional(),
  nextFieldId: z.number().optional(),
  order: z.union([z.number(), z.null()]).optional(),
  parentRefs: z.union([z.array(z.any()), z.null()]).optional(),
  readRoles: z.union([z.array(z.string()), z.null()]).optional(),
  uis: z.record(z.any()),
  writeRoles: z.union([z.array(z.string()), z.null()]).optional(),
})

export const Credentials = z.object({
  apiKey: z.string(),
  domain: z
    .string()
    .url()
    .transform((el: string) => el.replace(/\/$/, '')),
  workspaceId: z.string(),
})

export type DatabaseMetadata = {
  id: string
  name: string
}

export type DatabaseType = z.infer<typeof Database>
export type DatabaseSettingsType = z.infer<typeof DatabaseSettings>
export type DatabaseSchemaType = z.infer<typeof DatabaseSchema>
export type DatabaseSchemaBaseType = z.infer<typeof DatabaseSchemaBase>
export type DatabaseSchemaInFileType = z.infer<typeof DatabaseSchemaInFile>
export type DatabaseFileType = z.infer<typeof DatabaseFile>
export type TableFileType = z.infer<typeof TableFile>
export type DatabaseConfigFileContent = {
  database: DatabaseFileType
  tables: TableFileType[]
}
export type TableBaseType = z.infer<typeof TableBase>
