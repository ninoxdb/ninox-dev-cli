import { z } from "zod";

export const DatabaseSettings = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  rolesOpen: z.array(z.string()).optional(),
  rolesHistory: z.array(z.string()).optional(),
  rolesExport: z.array(z.string()).optional(),
  rolesImport: z.array(z.string()).optional(),
  rolesPrint: z.array(z.string()).optional(),
  rolesMassDataUpdate: z.array(z.string()).optional(),
  bgType: z.string().nullable().optional(),
  backgroundClass: z.string().nullable().optional(),
  backgroundTimestamp: z.number().nullable().optional(),
});

export const Database = z.object({
  id: z.string(),
  settings: DatabaseSettings,
});

const ExternalSchema: z.ZodSchema<any> = z.lazy(() => DatabaseSchema);

export const DatabaseSchemaBase = z.object({
  seq: z.number(),
  version: z.number(),
  nextTypeId: z.number(),
  afterOpenBehavior: z.enum(["openHome", "restoreNavigation"]),
  afterOpen: z.union([z.string(), z.null()]).optional(),
  globalCode: z.union([z.string(), z.null()]).optional(),
  fileSync: z.enum(["full", "cached"]),
  dateFix: z.enum(["enabled", "disabled"]),
  compatibility: z.string(),
  hideCalendar: z.boolean(),
  hideSearch: z.boolean(),
  hideDatabase: z.boolean(),
  hideNavigation: z.boolean(),
  knownDatabases: z
    .array(
      z.object({
        dbId: z.string(),
        name: z.string(),
        teamId: z.string(),
        teamName: z.string(),
      })
    )
    .optional(),
});

export const DatabaseSchemaLocal = z.object({
  schema: DatabaseSchemaBase.extend({
    _database: z.string(), // Database ID for local reference,
  }),
});

export const DatabaseSchema = DatabaseSchemaBase.extend({
  types: z.record(z.any()),
});

export const TableBase = z.object({
  nextFieldId: z.number(),
  uuid: z.string(),
  caption: z.string(),
  captions: z.record(z.any()),
  icon: z.string().optional(),
  hidden: z.boolean(),
  color: z.string().optional(),
  description: z.string().optional(),
  fields: z.record(z.any()),
  uis: z.record(z.any()),
  kind: z.enum(["table", "page"]),
  order: z.union([z.number(), z.null()]),
  readRoles: z.array(z.string()).optional(),
  writeRoles: z.array(z.string()).optional(),
  createRoles: z.array(z.string()).optional(),
  deleteRoles: z.array(z.string()).optional(),
  afterCreate: z.string().optional(),
  afterUpdate: z.string().optional(),
  canCreate: z.string().optional(),
  canRead: z.string().optional(),
  canWrite: z.string().optional(),
  canDelete: z.string().optional(),
  globalSearch: z.boolean(),
  hasFiles: z.boolean().optional(),
  hasComments: z.boolean().optional(),
  hasHistory: z.boolean().optional(),
});

export const Table = TableBase.extend({
  _id: z.string(), // key of the Schema.types object e.g A
});

export const TableLocal = z.object({
  table: Table.extend({
    _database: z.string(), // Database ID for local reference
  }),
});

export const DatabaseSchemaForUpload = z.object({
  seq: z.number(),
  version: z.number(),
  afterOpen: z.union([z.string(), z.null()]).optional(),
  isProtected: z.boolean().optional(),
  globalCode: z.union([z.string(), z.null()]).optional(),
  afterOpenBehavior: z.enum(["openHome", "restoreNavigation"]).optional(),
  fileSync: z.enum(["full", "cached"]).optional(),
  dateFix: z.enum(["enabled", "disabled"]).optional(),
  compatibility: z.string().optional(),
  dbId: z.union([z.string(), z.null()]),
  dbName: z.union([z.string(), z.null()]),
  hideCalendar: z.boolean().optional(),
  hideSearch: z.boolean().optional(),
  hideDatabase: z.boolean().optional(),
  hideNavigation: z.boolean().optional(),
  knownDatabases: z
    .array(
      z.object({
        dbId: z.string(),
        name: z.string(),
        teamId: z.string(),
        teamName: z.string(),
      })
    )
    .optional(),
});

export const TableForUpload = z.object({
  id: z.string(),
  nextFieldId: z.number().optional(),
  caption: z.string(),
  captions: z.record(z.string()),
  hidden: z.boolean(),
  globalSearch: z.boolean(),
  fields: z.record(z.any()),
  uis: z.record(z.any()),
  kind: z.enum(["table", "page"]),
  icon: z.union([z.string(), z.null()]).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  order: z.union([z.number(), z.null()]).optional(),
  color: z.any().optional(),
  background: z.any().optional(),
  isNew: z.union([z.boolean(), z.null()]).optional(),
  readRoles: z.union([z.array(z.string()), z.null()]).optional(),
  writeRoles: z.union([z.array(z.string()), z.null()]).optional(),
  createRoles: z.union([z.array(z.string()), z.null()]).optional(),
  deleteRoles: z.union([z.array(z.string()), z.null()]).optional(),
  afterUpdate: z.union([z.string(), z.null()]).optional(),
  afterCreate: z.union([z.string(), z.null()]).optional(),
  hasFiles: z.boolean().optional(),
  hasHistory: z.boolean().optional(),
  hasComments: z.boolean().optional(),
  _dateFields: z.record(z.any()).optional(),
  master: z.any().optional(),
  masterRef: z.any().optional(),
  parentRefs: z.union([z.array(z.any()), z.null()]).optional(),
  children: z.union([z.array(z.any()), z.null()]).optional(),
});

export const Credentials = z.object({
  domain: z.string().url(),
  apiKey: z.string(),
  workspaceId: z.string(),
  protocol: z.enum(["http", "https"]).optional(),
});

export type DatabaseSchemaType = z.infer<typeof DatabaseSchema>;
export type DatabaseSchemaLocalType = z.infer<typeof DatabaseSchemaLocal>;
export type TableType = z.infer<typeof Table>;
export type TableLocalType = z.infer<typeof TableLocal>;
export type DatabaseType = z.infer<typeof Database>;
export type DatabaseSettingsType = z.infer<typeof DatabaseSettings>;
