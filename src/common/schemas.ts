import { after } from "node:test";
import { version } from "os";
import { z } from "zod";

export const DatabaseSchema = z.object({
  id: z.string(),
  settings: z.object({
    name: z.string(),
    icon: z.string(),
    color: z.string(),
    bgType: z.string().optional(),
    backgroundClass: z.string().optional(),
    backgroundTimestamp: z.number().optional(),
  }),
});

const ExternalSchema: z.ZodSchema<any> = z.lazy(() => DatabaseSchemaSchema);

export const DatabaseSchemaForUpload = z
  .object({
    isProtected: z.boolean(),
    seq: z.number(),
    version: z.number(),
    queryCache: z.record(z.union([z.string(), z.null()])),
    afterOpen: z.union([z.string(), z.null()]),
    globalCode: z.union([z.string(), z.null()]),
    afterOpenBehavior: z.enum(["openHome", "restoreNavigation"]),
    fileSync: z.enum(["full", "cached"]),
    dateFix: z.enum(["enabled", "disabled"]),
    compatibility: z.string(),
    dbId: z.union([z.string(), z.null()]),
    dbName: z.union([z.string(), z.null()]),
    hideCalendar: z.boolean(),
    hideSearch: z.boolean(),
    hideDatabase: z.boolean(),
    hideNavigation: z.boolean(),
    knownDatabases: z.array(
      z.object({
        dbId: z.string(),
        name: z.string(),
        teamId: z.string(),
        teamName: z.string(),
      })
    ),
  })
  .partial();

export const DatabaseSchemaSchema = z
  .object({
    isProtected: z.boolean(),
    seq: z.number(),
    version: z.number(),
    nextTypeId: z.number(),
    queryCache: z.record(z.union([z.string(), z.null()])),
    afterOpen: z.union([z.string(), z.null()]),
    globalCode: z.union([z.string(), z.null()]),
    globalScope: z.record(z.any()),
    afterOpenBehavior: z.enum(["openHome", "restoreNavigation"]),
    fileSync: z.enum(["full", "cached"]),
    dateFix: z.enum(["enabled", "disabled"]),
    compatibility: z.string(),
    dbId: z.union([z.string(), z.null()]),
    dbName: z.union([z.string(), z.null()]),
    hideCalendar: z.boolean(),
    hideSearch: z.boolean(),
    hideDatabase: z.boolean(),
    hideNavigation: z.boolean(),
    knownDatabases: z.array(
      z.object({
        dbId: z.string(),
        name: z.string(),
        teamId: z.string(),
        teamName: z.string(),
      })
    ),
    externalSchemas: z.record(ExternalSchema),
  })
  .partial();

export const DatabaseSchemaSchemaLocal = DatabaseSchemaSchema.extend({
  database: z.string(),
});

// export const FieldSchemaForUpload = z.object({

export const TableSchemaForUpload = z
  .object({
    id: z.string(),
    nextFieldId: z.number().optional(),
    isSQLFilterable: z.boolean(),
    queryCache: z.record(z.union([z.string(), z.null()])),
    caption: z.string(),
    captions: z.record(z.string()),
    icon: z.union([z.string(), z.null()]),
    hidden: z.boolean(),
    description: z.union([z.string(), z.null()]),
    globalSearch: z.boolean(),
    fields: z.record(z.any()),
    uis: z.record(z.any()),
    color: z.any(),
    background: z.any(),
    isNew: z.union([z.boolean(), z.null()]),
    readRoles: z.union([z.array(z.string()), z.null()]),
    writeRoles: z.union([z.array(z.string()), z.null()]),
    createRoles: z.union([z.array(z.string()), z.null()]),
    deleteRoles: z.union([z.array(z.string()), z.null()]),
    afterUpdate: z.union([z.string(), z.null()]),
    afterCreate: z.union([z.string(), z.null()]),
    hasFiles: z.boolean(),
    hasHistory: z.boolean(),
    hasComments: z.boolean(),
    order: z.union([z.number(), z.null()]),
    _dateFields: z.record(z.any()),
    master: z.any(),
    masterRef: z.any(),
    parentRefs: z.union([z.array(z.any()), z.null()]),
    children: z.union([z.array(z.any()), z.null()]),
    kind: z.enum(["table", "page"]),
  })
  .partial();

export const TableSchema = z
  .object({
    isSQLFilterable: z.boolean(),
    comparator: z.string(),
    queryCache: z.record(z.union([z.string(), z.null()])),
    nextFieldId: z.number(),
    id: z.string(),
    caption: z.string(),
    captions: z.record(z.string()),
    icon: z.union([z.string(), z.null()]),
    hidden: z.boolean(),
    description: z.union([z.string(), z.null()]),
    globalSearch: z.boolean(),
    fields: z.record(z.any()),
    uis: z.record(z.any()), // Allows any properties within uis
    sorted: z.array(z.any()),
    color: z.any(),
    background: z.any(),
    uuid: z.string(),
    fulltextTokens: z.any(),
    isNew: z.union([z.boolean(), z.null()]),
    readRoles: z.union([z.array(z.string()), z.null()]),
    writeRoles: z.union([z.array(z.string()), z.null()]),
    createRoles: z.union([z.array(z.string()), z.null()]),
    deleteRoles: z.union([z.array(z.string()), z.null()]),
    afterUpdate: z.union([z.string(), z.null()]),
    afterCreate: z.union([z.string(), z.null()]),
    hasFiles: z.boolean(),
    hasHistory: z.boolean(),
    hasComments: z.boolean(),
    order: z.union([z.number(), z.null()]),
    _dateFields: z.record(z.any()),
    master: z.any(),
    masterRef: z.any(),
    parentRefs: z.union([z.array(z.any()), z.null()]),
    children: z.union([z.array(z.any()), z.null()]),
    kind: z.enum(["table", "page"]),
  })
  .partial();

export const TableSchemaLocal = TableSchema.extend({
  database: z.string(),
});

export type Schema = z.infer<typeof DatabaseSchemaSchema>;
export type Table = z.infer<typeof TableSchema>;
