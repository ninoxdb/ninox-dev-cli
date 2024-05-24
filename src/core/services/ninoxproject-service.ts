import * as yaml from 'js-yaml'

import {
  Database,
  DatabaseConfigFileContent,
  DatabaseFile,
  DatabaseFileType,
  DatabaseSchema,
  DatabaseSchemaBase,
  DatabaseSchemaBaseType,
  DatabaseSchemaType,
  DatabaseType,
  TableBase,
  TableFile,
  TableFileType,
} from '../common/schema-validators.js'
import {DBConfigsYaml} from '../common/types.js'
import {FSUtil} from '../utils/fs.js'
import {IProjectService} from './interfaces.js'

export class NinoxProjectService implements IProjectService {
  private fsUtil: FSUtil
  public constructor(fsUtil: FSUtil) {
    this.fsUtil = fsUtil
  }

  public async createDatabaseFolderInFiles(databaseId: string): Promise<void> {
    await this.fsUtil.createDatabaseFolderInFiles(databaseId)
  }

  public getDbBackgroundImagePath(databaseId: string): string {
    return this.fsUtil.getDbBackgroundImagePath(databaseId)
  }

  public async initialiseProject(name: string): Promise<void> {
    await this.fsUtil.createPackageJson(name)
    await this.fsUtil.createConfigYaml()
    await this.fsUtil.ensureRootDirectoryStructure()
  }

  public isDbBackgroundImageExists(databaseId: string, imagePath?: string): boolean {
    return this.fsUtil.isDatabaseBackgroundFileExist(databaseId, imagePath)
  }

  public parseDatabaseConfigs(
    database: unknown,
    sc: unknown,
  ): {database: DatabaseType; schema: DatabaseSchemaBaseType; tables: TableFileType[]} {
    const parsedDatabase = Database.safeParse(database)
    const parsedSchema = DatabaseSchema.safeParse(sc)

    if (!parsedDatabase.success || !parsedSchema.success)
      throw new Error('Validation errors: Database or Schema validation failed')

    const schema = DatabaseSchemaBase.parse(parsedSchema.data)
    const inputTypes = parsedSchema.data.types

    const tables = Object.entries(inputTypes).map(([key, value]) => {
      const parsedTable = TableBase.safeParse(value)
      if (!parsedTable.success)
        throw new Error(`Validation errors: Table validation failed ${parsedSchema.data.types[key]?.caption}`)
      return TableFile.parse({
        table: {
          ...parsedTable.data,
          _database: parsedDatabase.data.id,
          _id: key,
        },
      })
    })

    return {database: parsedDatabase.data, schema, tables}
  }

  public parseDatabaseConfigsbaseAndSchemaFromFileContent(databaseConfig: DatabaseConfigFileContent): {
    database: DatabaseType
    schema: DatabaseSchemaType
  } {
    const databaseParseResult = DatabaseFile.safeParse(databaseConfig.databaseLocal)
    if (!databaseParseResult.success) {
      throw new Error(
        `Database validation failed for database: ${databaseConfig.databaseLocal?.database?.settings?.name} (${databaseConfig.databaseLocal.database.id})`,
      )
    }

    const schema: DatabaseSchemaType = {
      ...databaseParseResult.data.database.schema,
      types: {},
    }
    for (const tableFileData of databaseConfig.tablesLocal) {
      const tableResult = TableFile.safeParse(tableFileData)
      if (!tableResult.success) {
        throw new Error('Table validation failed for table with id: ' + tableFileData.table._id)
      }

      schema.types[tableResult.data.table._id] = TableBase.parse(tableResult.data.table)
    }

    return {
      database: Database.parse(databaseParseResult.data.database),
      schema,
    }
  }

  public async readDatabaseConfigFromFiles(
    databaseId: string,
  ): Promise<{database: DatabaseType; schema: DatabaseSchemaType}> {
    const databaseConfigInYaml = await this.fsUtil.readDatabaseConfigFromFiles(databaseId)
    const databaseConfig = this.parseDatabaseConfigsbaseConfigFileContentFromYaml(databaseConfigInYaml)
    const parsedDBConfig = this.parseDatabaseConfigsbaseAndSchemaFromFileContent(databaseConfig)
    return parsedDBConfig
  }

  // Write the database, schema and tables to their respective files
  public async writeDatabaseToFiles(
    database: DatabaseType,
    schema: DatabaseSchemaBaseType,
    tables: TableFileType[],
  ): Promise<void> {
    await this.fsUtil.ensureRootDirectoryStructure()
    // Create a subfolder in the root directory/Objects with name Database_${id}
    await this.fsUtil.createDatabaseFolderInObjects(database.id)
    await this.fsUtil.writeFile(
      this.fsUtil.getObjectPath(database.id, this.fsUtil.getObjectFileName('Database', database.settings.name)),
      yaml.dump(
        DatabaseFile.parse({
          database: {
            ...database,
            schema: {...schema, _database: database.id},
          },
        }),
      ),
    )
    const fileWritePromises = []
    // table
    for (const tableFileData of tables) {
      const fileWritePromise = this.fsUtil.writeFile(
        this.fsUtil.getObjectPath(
          database.id,
          this.fsUtil.getObjectFileName(
            tableFileData.table.kind === 'page' ? 'Page' : 'Table',
            tableFileData.table.caption as string,
          ),
        ),
        yaml.dump(tableFileData),
      )
      fileWritePromises.push(fileWritePromise)
    }

    await Promise.all(fileWritePromises)
  }

  private parseDatabaseConfigsbaseConfigFileContentFromYaml(
    databaseConfigYaml: DBConfigsYaml,
  ): DatabaseConfigFileContent {
    const {database: databaseYaml, tables: tablesYaml} = databaseConfigYaml
    return {
      databaseLocal: yaml.load(databaseYaml) as DatabaseFileType,
      tablesLocal: tablesYaml.map((table) => yaml.load(table) as TableFileType),
    } satisfies DatabaseConfigFileContent
  }
}
