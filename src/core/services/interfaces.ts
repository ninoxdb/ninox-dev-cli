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
  getReportFilesFolderPath(reportId: string): string
  initialiseProject(name: string): Promise<void>
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
  writeDatabaseFile(database: DatabaseType, schema: DatabaseSchemaBaseType): Promise<void>
  writeDatabaseToFiles(
    database: DatabaseType,
    schema: DatabaseSchemaBaseType,
    tables: TableFileType[],
    views: ViewTypeFile[],
    reports: ReportTypeFile[],
  ): Promise<void>
}
