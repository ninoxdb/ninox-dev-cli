import {z} from 'zod'

export const DatabaseSettings = z.object({
  backgroundClass: z.string().nullable().optional(),
  bgType: z.string().nullable().optional(),
  color: z.string(),
  icon: z.string(),
  name: z.string(),
  rolesExport: z.array(z.string()).nullable().optional(),
  rolesHistory: z.array(z.string()).nullable().optional(),
  rolesImport: z.array(z.string()).nullable().optional(),
  rolesMassDataUpdate: z.array(z.string()).nullable().optional(),
  rolesOpen: z.array(z.string()).nullable().optional(),
  rolesPrint: z.array(z.string()).nullable().optional(),
})

export const Database = z.object({
  id: z.string(),
  settings: DatabaseSettings,
})

export const DatabaseSchemaBase = z.object({
  afterOpen: z.union([z.string(), z.null()]).nullable().optional(),
  afterOpenBehavior: z.enum(['openHome', 'restoreNavigation']),
  compatibility: z.string(),
  dateFix: z.enum(['enabled', 'disabled']),
  fileSync: z.enum(['full', 'cached']),
  globalCode: z.union([z.string(), z.null()]).nullable().optional(),
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
    .nullable()
    .optional(),
  nextTypeId: z.number(),
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
  afterCreate: z.string().nullable().optional(),
  afterUpdate: z.string().nullable().optional(),
  canCreate: z.string().nullable().optional(),
  canDelete: z.string().nullable().optional(),
  canRead: z.string().nullable().optional(),
  canWrite: z.string().nullable().optional(),
  caption: z.string(),
  captions: z.record(z.any()),
  color: z.string().nullable().optional(),
  createRoles: z.array(z.string()).nullable().optional(),
  deleteRoles: z.array(z.string()).nullable().optional(),
  description: z.string().nullable().optional(),
  fields: z.record(z.any()),
  globalSearch: z.boolean(),
  hasComments: z.boolean().nullable().optional(),
  hasFiles: z.boolean().nullable().optional(),
  hasHistory: z.boolean().nullable().optional(),
  hidden: z.boolean(),
  icon: z.string().nullable().optional(),
  kind: z.enum(['table', 'page']),
  nextFieldId: z.number(),
  order: z.union([z.number(), z.null()]).nullable().optional(),
  readRoles: z.array(z.string()).nullable().optional(),
  uis: z.record(z.any()),
  uuid: z.string(),
  writeRoles: z.array(z.string()).nullable().optional(),
})

export const TableFile = z.object({
  table: TableBase.extend({
    _database: z.string(), // Database ID for local reference
    _id: z.string(), // key of the Schema.types object e.g A
  }),
})

export const DatabaseSchemaForUpload = z.object({
  afterOpen: z.union([z.string(), z.null()]).nullable().optional(),
  afterOpenBehavior: z.enum(['openHome', 'restoreNavigation']).nullable().optional(),
  compatibility: z.string().nullable().optional(),
  dateFix: z.enum(['enabled', 'disabled']).nullable().optional(),
  dbId: z.union([z.string(), z.null()]),
  dbName: z.union([z.string(), z.null()]),
  fileSync: z.enum(['full', 'cached']).nullable().optional(),
  globalCode: z.union([z.string(), z.null()]).nullable().optional(),
  hideCalendar: z.boolean().nullable().optional(),
  hideDatabase: z.boolean().nullable().optional(),
  hideNavigation: z.boolean().nullable().optional(),
  hideSearch: z.boolean().nullable().optional(),
  isProtected: z.boolean().nullable().optional(),
  knownDatabases: z
    .array(
      z.object({
        dbId: z.string(),
        name: z.string(),
        teamId: z.string(),
        teamName: z.string(),
      }),
    )
    .nullable()
    .optional(),
  version: z.number(),
})

export const TableForUpload = z.object({
  _dateFields: z.record(z.any()).nullable().optional(),
  afterCreate: z.union([z.string(), z.null()]).nullable().optional(),
  afterUpdate: z.union([z.string(), z.null()]).nullable().optional(),
  background: z.any().nullable().optional(),
  caption: z.string(),
  captions: z.record(z.string()),
  children: z
    .union([z.array(z.any()), z.null()])
    .nullable()
    .optional(),
  color: z.any().nullable().optional(),
  createRoles: z
    .union([z.array(z.string()), z.null()])
    .nullable()
    .optional(),
  deleteRoles: z
    .union([z.array(z.string()), z.null()])
    .nullable()
    .optional(),
  description: z.union([z.string(), z.null()]).nullable().optional(),
  fields: z.record(z.any()),
  globalSearch: z.boolean(),
  hasComments: z.boolean().nullable().optional(),
  hasFiles: z.boolean().nullable().optional(),
  hasHistory: z.boolean().nullable().optional(),
  hidden: z.boolean(),
  icon: z.union([z.string(), z.null()]).nullable().optional(),
  id: z.string(),
  isNew: z.union([z.boolean(), z.null()]).nullable().optional(),
  kind: z.enum(['table', 'page']),
  master: z.any().nullable().optional(),
  masterRef: z.any().nullable().optional(),
  nextFieldId: z.number().nullable().optional(),
  order: z.union([z.number(), z.null()]).nullable().optional(),
  parentRefs: z
    .union([z.array(z.any()), z.null()])
    .nullable()
    .optional(),
  readRoles: z
    .union([z.array(z.string()), z.null()])
    .nullable()
    .optional(),
  uis: z.record(z.any()),
  writeRoles: z
    .union([z.array(z.string()), z.null()])
    .nullable()
    .optional(),
})

export const Credentials = z.object({
  apiKey: z.string(),
  domain: z
    .string()
    .url()
    .transform((element: string) => element.replace(/\/$/, '')),
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
  databaseLocal: DatabaseFileType
  tablesLocal: TableFileType[]
}
export type TableBaseType = z.infer<typeof TableBase>
export type GetDatabaseResponse = {
  schema: DatabaseSchemaType
  settings: DatabaseSettingsType
}

const ConfigColumnSchema = z.object({
  caption: z.string().nullable().optional(),
  expression: z.string(),
  filter: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
})

const ConfigSchema = z.object({
  cols: z.array(ConfigColumnSchema).nullable().optional(),
  descending: z.boolean().nullable().optional(),
  group: z.number().nullable().optional(),
  sort: z.number().nullable().optional(),
  type: z.string(),
})

export const ViewTypeSchema = z.object({
  caption: z.string(),
  config: ConfigSchema,
  id: z.string(),
  kanbanDisableCreate: z.boolean().nullable().optional(),
  mode: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  type: z.string(),
})

export const ViewSchemaFile = z.object({
  view: ViewTypeSchema.extend({
    _database: z.string(),
    _table: z.string(),
  }),
})

const minimalReportSchema = z.object({
  caption: z.string(),
  id: z.string(),
  nids: z.array(z.string()).nullable().optional(),
  tid: z.string(),
})

const normalReportObjectSchema = z.object({
  backgroundColor: z.string().nullable().optional(),
  base: z.enum(['text', 'rev', 'image', 'imagefield', 'html']),
  borderColor: z.string().nullable().optional(),
  borderRadius: z.number().nullable().optional(),
  borderStyle: z.string().nullable().optional(),
  borderWidth: z.number().nullable().optional(),
  file: z.any().nullable().optional(),
  fontFamily: z.string().nullable().optional(),
  fontSize: z.number().nullable().optional(),
  fontStyle: z.enum(['italic']).nullable().optional(),
  fontWeight: z.enum(['bold']).nullable().optional(),
  h: z.number().nullable().optional(),
  isAutoHeight: z.boolean().nullable().optional(),
  lineHeight: z.number().nullable().optional(),
  paddingB: z.number().nullable().optional(),
  paddingL: z.number().nullable().optional(),
  paddingR: z.number().nullable().optional(),
  paddingT: z.number().nullable().optional(),
  position: z.enum(['head', 'foot', 'page']),
  text: z.string().nullable().optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).nullable().optional(),
  textColor: z.string().nullable().optional(),
  textDecoration: z.enum(['underline']).nullable().optional(),
  verticalAlign: z.enum(['middle', 'bottom']).nullable().optional(),
  w: z.number().nullable().optional(),
  x: z.number().nullable().optional(),
  y: z.number().nullable().optional(),
})

const normalReportSchema = minimalReportSchema.extend({
  fontFamily: z.string().nullable().optional(),
  fontSize: z.number().nullable().optional(),
  footHeight: z.number().nullable().optional(),
  headHeight: z.number().nullable().optional(),
  marginB: z.number().nullable().optional(),
  marginL: z.number().nullable().optional(),
  marginR: z.number().nullable().optional(),
  marginT: z.number().nullable().optional(),
  objects: z.array(normalReportObjectSchema).nullable().optional(),
  paperHeight: z.number().nullable().optional(),
  paperWidth: z.number().nullable().optional(),
  printAttachments: z.boolean().nullable().optional(),
})

const carboneReportSchema = minimalReportSchema.extend({
  customDataExp: z.string(),
  customDataSource: z.boolean(),
  recurcionLevel: z.number(),
  reportType: z.literal('carbone'),
  // other fields not specified in ninox-core
  testPrint: z.boolean().nullable().optional(),
  // eslint-disable-next-line perfectionist/sort-objects
  pdfPassword: z.string().nullable().optional(),
  setPassword: z.boolean().nullable().optional(),
})

export const reportSchema = z.union([normalReportSchema, carboneReportSchema])

const normalReportFileSchema = z.object({
  report: normalReportSchema.extend({
    _database: z.string(),
  }),
})

const carboneReportFileSchema = z.object({
  report: carboneReportSchema.extend({
    _database: z.string(),
  }),
})

export const reportFileSchema = z.union([normalReportFileSchema, carboneReportFileSchema])

export type NormalReport = z.infer<typeof normalReportSchema>
export type CarboneReport = z.infer<typeof carboneReportSchema>
export type Report = CarboneReport | NormalReport
export type ReportTypeFile = z.infer<typeof reportFileSchema>
export type ViewType = z.infer<typeof ViewTypeSchema>
export type ViewTypeFile = z.infer<typeof ViewSchemaFile>
