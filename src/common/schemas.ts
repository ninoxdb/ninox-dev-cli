export const DatabaseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    settings: {
      type: "object",
      properties: {
        name: { type: "string" },
        icon: { type: "string" },
        color: { type: "string" },
      },
      required: ["name", "icon", "color"],
      additionalProperties: false,
    },
  },
  required: ["id", "settings"],
  additionalProperties: true,
};

export const DatabaseSchemaSchema = {
  type: "object",
  properties: {
    database: { type: "string" },
    isProtected: { type: "boolean" },
    seq: { type: "number" },
    version: { type: "number" },
    nextTypeId: { type: "number" },
    queryCache: {
      type: "object",
      additionalProperties: {
        type: ["string", "null"],
      },
    },
    afterOpen: { type: ["string", "null"] },
    globalCode: { type: ["string", "null"] },
    globalCodeExp: { type: ["string", "null"] },
    globalScope: { type: "object", additionalProperties: true }, // allowing any properties as `any` type is used in TypeScript
    afterOpenBehavior: {
      type: "string",
      enum: ["openHome", "restoreNavigation"],
    },
    fileSync: { type: "string", enum: ["full", "cached"] },
    dateFix: { type: "string", enum: ["enabled", "disabled"] },
    compatibility: { type: "string", enum: ["latest", "3.7.0"] },
    dbId: { type: ["string", "null"] },
    dbName: { type: ["string", "null"] },
    hideCalendar: { type: "boolean" },
    hideSearch: { type: "boolean" },
    hideDatabase: { type: "boolean" },
    hideNavigation: { type: "boolean" },
    knownDatabases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dbId: { type: "string" },
          name: { type: "string" },
          teamId: { type: "string" },
          teamName: { type: "string" },
        },
        required: ["dbId", "name", "teamId", "teamName"],
      },
    },
    externalSchemas: {
      type: "object",
      additionalProperties: {
        // This needs to reference the same schema recursively; handled programmatically in AJV setup
      },
    },
  },
  required: [],
  additionalProperties: true,
};

export const TableSchema = {
  type: "object",
  properties: {
    isSQLFilterable: { type: "boolean" },
    comparator: { type: "string" },
    queryCache: {
      type: "object",
      additionalProperties: { type: ["string", "null"] },
    },
    nextFieldId: { type: "number" },
    id: { type: "string" },
    caption: { type: "string" },
    captions: {
      type: "object",
      additionalProperties: { type: "string" },
    },
    icon: { type: ["string", "null"] },
    hidden: { type: "boolean" },
    description: { type: ["string", "null"] },
    globalSearch: { type: "boolean" },
    fields: {
      type: "object",
      base: { type: "string" },
      uuid: { type: "string" },
      caption: { type: "string" },
      additionalProperties: true, // Allowing any type of properties since fields are of type `unknown`
    },
    uis: {
      type: "object",
      base: { type: "string" },
      uuid: { type: "string" },
      caption: { type: "string" },
      additionalProperties: true, // Allowing any type of properties
    },
    sorted: {
      type: "array",
      items: {}, // Allowing any type of items since `sorted` is an Array of `unknown`
    },
    color: {}, // Allowing any type of value since `color` is `any`
    background: {}, // Allowing any type of value
    uuid: {}, // Allowing any type
    fulltextTokens: {}, // Allowing any type
    isNew: { type: ["boolean", "null"] },
    readRoles: {
      type: ["array", "null"],
      items: { type: "string" },
    },
    writeRoles: {
      type: ["array", "null"],
      items: { type: "string" },
    },
    createRoles: {
      type: ["array", "null"],
      items: { type: "string" },
    },
    deleteRoles: {
      type: ["array", "null"],
      items: { type: "string" },
    },
    afterUpdate: { type: ["string", "null"] },
    afterCreate: { type: ["string", "null"] },
    canRead: { type: ["string", "null"] },
    canWrite: { type: ["string", "null"] },
    canCreate: { type: ["string", "null"] },
    canDelete: { type: ["string", "null"] },
    hasFiles: { type: "boolean" },
    hasHistory: { type: "boolean" },
    hasComments: { type: "boolean" },
    order: { type: ["number", "null"] },
    _dateFields: {
      type: "object",
      additionalProperties: true, // Allowing any type of properties
    },
    master: {}, // Allowing any type
    masterRef: {}, // Allowing any type
    parentRefs: {
      type: ["array", "null"],
      items: {}, // Allowing any type of items
    },
    children: {
      type: ["array", "null"],
      items: {}, // Allowing any type of items
    },
    kind: { type: "string", enum: ["table", "page"] },
  },
  required: ["id", "uuid", "caption", "globalSearch", "fields", "uis"],
  additionalProperties: true,
};
