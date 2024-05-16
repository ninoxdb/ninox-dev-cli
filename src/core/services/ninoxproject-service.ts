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

export class NinoxProjectService {
  databaseId?: string
  fsUtil: FSUtil
  name?: string
  constructor(fsUtil: FSUtil, databaseId?: string, name?: string) {
    this.fsUtil = fsUtil
    this.databaseId = databaseId
    this.name = name
  }

  public async createDatabaseFolderInFiles(dbId: string = this.databaseId as string) {
    await this.fsUtil.createDatabaseFolderInFiles(dbId)
  }

  public getDbBackgroundImagePath(dbId: string) {
    return this.fsUtil.getDbBackgroundImagePath(dbId)
  }

  public async initialiseProject(name: string = this.name as string): Promise<void> {
    await this.fsUtil.createPackageJson(name)
    await this.fsUtil.createConfigYaml()
    await this.fsUtil.ensureRootDirectoryStructure()
  }

  public async isDbBackgroundImageExists(dbId: string, imagePath?: string) {
    return this.fsUtil.isDatabaseBackgroundFileExist(dbId, imagePath)
  }

  public parseData(
    db: unknown,
    sc: unknown,
  ): {database: DatabaseType; schema: DatabaseSchemaBaseType; tables: TableFileType[]} {
    const parsedDatabase = Database.safeParse(db)
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

  public parseDatabaseAndSchemaFromFileContent(dbConfig: DatabaseConfigFileContent): {
    database: DatabaseType
    schema: DatabaseSchemaType
  } {
    const databaseParseResult = DatabaseFile.safeParse(dbConfig.databaseLocal)
    if (!databaseParseResult.success) {
      throw new Error(
        `Database validation failed for database: ${dbConfig.databaseLocal?.database?.settings?.name} (${dbConfig.databaseLocal.database.id})`,
      )
    }

    const schema: DatabaseSchemaType = {
      ...databaseParseResult.data.database.schema,
      types: {},
    }
    for (const tableFileData of dbConfig.tablesLocal) {
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

  public async readDatabaseConfig(
    dbId: string = this.databaseId as string,
  ): Promise<{database: DatabaseType; schema: DatabaseSchemaType}> {
    const dbConfigInYaml = await this.fsUtil.readDatabaseConfig(dbId)
    const dbConfig = this.parseDatabaseConfigFileContentFromYaml(dbConfigInYaml)
    const parsedDBConfig = this.parseDatabaseAndSchemaFromFileContent(dbConfig)
    return parsedDBConfig
  }

  // Write the database, schema and tables to their respective files
  public async writeToFiles(database: DatabaseType, schema: DatabaseSchemaBaseType, tables: TableFileType[]) {
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

  private parseDatabaseConfigFileContentFromYaml(dbConfigYaml: DBConfigsYaml) {
    const {database: databaseYaml, tables: tablesYaml} = dbConfigYaml
    return {
      databaseLocal: yaml.load(databaseYaml) as DatabaseFileType,
      tablesLocal: tablesYaml.map((table) => yaml.load(table) as TableFileType),
    } satisfies DatabaseConfigFileContent
  }
}
