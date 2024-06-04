import {
  DatabaseSchemaBaseType,
  DatabaseSchemaType,
  DatabaseType,
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
  isDbBackgroundImageExist(): boolean
  parseDatabaseConfigs(
    database: unknown,
    sc: unknown,
    views: View[],
  ): {database: DatabaseType; schema: DatabaseSchemaBaseType; tables: TableFileType[]; views: ViewTypeFile[]}
  parseLocalObjectsToNinoxObjects(
    dBConfigsYaml: DBConfigsYaml,
  ): [database: DatabaseType, schema: DatabaseSchemaType, views: ViewType[], reports: any[]]
  readDBConfig(): Promise<DBConfigsYaml>
  readDatabaseConfigFromFiles(databaseId: string): Promise<{database: DatabaseType; schema: DatabaseSchemaType}>
  writeDatabaseToFiles(
    database: DatabaseType,
    schema: DatabaseSchemaBaseType,
    tables: TableFileType[],
    views: ViewTypeFile[],
    reports: any[],
  ): Promise<void>
}
