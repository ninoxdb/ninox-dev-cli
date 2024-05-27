import {DatabaseSchemaBaseType, DatabaseSchemaType, DatabaseType, TableFileType} from '../common/schema-validators.js'

export interface INinoxObjectService<T> {
  download(id: string): Promise<void>
  list(): Promise<T[]>
  upload(id: string): Promise<void>
}

export interface IProjectService {
  createDatabaseFolderInFiles(databaseId: string): Promise<void>
  getDbBackgroundImagePath(databaseId: string): string
  initialiseProject(name: string): Promise<void>
  isDbBackgroundImageExist(databaseId: string, imagePath?: string): boolean
  parseDatabaseConfigs(
    database: unknown,
    sc: unknown,
  ): {database: DatabaseType; schema: DatabaseSchemaBaseType; tables: TableFileType[]}
  readDatabaseConfigFromFiles(databaseId: string): Promise<{database: DatabaseType; schema: DatabaseSchemaType}>
  writeDatabaseToFiles(database: DatabaseType, schema: DatabaseSchemaBaseType, tables: TableFileType[]): Promise<void>
}
