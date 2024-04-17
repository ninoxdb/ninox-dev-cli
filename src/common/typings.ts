export interface Database {
  id: string;
  settings: {
    name: string;
    icon: string;
    color: string;
    bgType?: string;
    backgroundClass?: string;
    backgroundTimestamp?: number;
  };
}

export interface Schema {
  database: string;
  isProtected: boolean;
  readonly seq: number;
  readonly version: number;
  nextTypeId: number;
  queryCache: { [key: string]: string | undefined };
  readonly afterOpen: string | undefined;
  readonly globalCode: string | undefined;
  globalCodeExp: string | undefined;
  globalScope: any;
  afterOpenBehavior: "openHome" | "restoreNavigation";
  fileSync: "full" | "cached";
  dateFix: "enabled" | "disabled";
  compatibility: "latest" | "3.7.0";
  dbId: string | undefined;
  dbName: string | undefined;
  hideCalendar: boolean;
  hideSearch: boolean;
  hideDatabase: boolean;
  hideNavigation: boolean;
  knownDatabases: {
    dbId: string;
    name: string;
    teamId: string;
    teamName: string;
  }[];
  externalSchemas: { [key: string]: Schema };
}

export interface Table {
  isSQLFilterable: boolean;
  comparator: string;
  queryCache: Record<string, string | undefined>;
  nextFieldId: number;
  id: string;
  caption: string;
  captions: { [key: string]: string };
  icon: string | undefined;
  hidden: boolean;
  description: string | undefined;

  globalSearch: boolean;
  fields: {
    [key: string]: unknown;
  };
  uis: { [key: string]: unknown };
  sorted: Array<unknown>;
  color: any;
  background: any;
  uuid: any;
  fulltextTokens: any;
  isNew?: boolean;

  readRoles: string[] | undefined;
  writeRoles: string[] | undefined;
  createRoles: string[] | undefined;
  deleteRoles: string[] | undefined;

  afterUpdate: string | undefined;
  afterCreate: string | undefined;
  canRead: string | undefined;
  canWrite: string | undefined;
  canCreate: string | undefined;
  canDelete: string | undefined;

  canReadExp: string | undefined;
  canWriteExp: string | undefined;
  canCreateExp: string | undefined;
  canDeleteExp: string | undefined;

  afterCreateExp: string | undefined;
  afterUpdateExp: string | undefined;

  hasFiles: boolean;
  hasHistory: boolean;
  hasComments: boolean;
  order: number | undefined;
  _dateFields: { [key: string]: unknown };

  master: any;
  masterRef: any;
  parentRefs: unknown[] | undefined;
  children: unknown[] | undefined;

  kind: "table" | "page";
}
