import {
  DatabaseSchemaBaseType,
  DatabaseSchemaType,
  DatabaseType,
  Report,
  ReportTypeFile,
  TableFileType,
  ViewType,
  ViewTypeFile,
} from '../common/schema-validators.js'
import {DBConfigsYaml, View} from '../common/types.js'

export interface INinoxObjectService<T> {
  download(): Promise<void>
  getDBId(): string
  getDBName(): string
  list(): Promise<T[]>
  upload(): Promise<void>
}

export interface IProjectService {
  createDatabaseFolderInFiles(): Promise<void>
  getDbBackgroundImagePath(): string
  initialiseProject(name: string): Promise<void>
  isDatabaseNameConflictExist(databaseName: string): Promise<boolean>
  isDbBackgroundImageExist(): boolean
  parseDatabaseConfigs(
    database: unknown,
    sc: unknown,
    views: View[],
    reports: Report[],
  ): {
    database: DatabaseType
    reports: ReportTypeFile[]
    schema: DatabaseSchemaBaseType
    tables: TableFileType[]
    views: ViewTypeFile[]
  }
  parseLocalObjectsToNinoxObjects(
    dBConfigsYaml: DBConfigsYaml,
  ): [database: DatabaseType, schema: DatabaseSchemaType, views: ViewType[], reports: Report[]]
  readDBConfig(): Promise<DBConfigsYaml>
  reinitialisePathsWithDBName(databaseName: string): void
  writeDatabaseToFiles(
    database: DatabaseType,
    schema: DatabaseSchemaBaseType,
    tables: TableFileType[],
    views: ViewTypeFile[],
    reports: ReportTypeFile[],
  ): Promise<void>
}
