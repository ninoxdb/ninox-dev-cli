interface Database {
  id: string;
  settings: {
    name: string;
    icon: string;
    color: string;
  };
}

interface DatabaseSchema {
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
  externalSchemas: { [key: string]: DatabaseSchema };
}
