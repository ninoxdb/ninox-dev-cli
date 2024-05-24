import * as yaml from 'js-yaml'
import fs from 'node:fs'
import * as fsAsync from 'node:fs/promises'
import path from 'node:path'
import {inject, injectable} from 'tsyringe'

import {
  CREDENTIALS_FILE_NAME,
  ConfigYamlTemplate,
  DB_BACKGROUND_FILE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_NAME,
  DEFAULT_VERSION,
} from '../common/constants.js'
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

@injectable()
export class NinoxProjectService implements IProjectService {
  private basePath: string
  private credentialsFilePath: string
  private filesPath: string
  private fsUtil: FSUtil
  private objectsPath: string
  public constructor(@inject(FSUtil) fsUtil: FSUtil) {
    this.fsUtil = fsUtil
    this.basePath = process.cwd()
    this.credentialsFilePath = path.join(this.basePath, CREDENTIALS_FILE_NAME)
    this.filesPath = path.join(this.basePath, 'src', 'Files')
    this.objectsPath = path.join(this.basePath, 'src', 'Objects')
  }

  public async createConfigYaml(): Promise<void> {
    if (this.fsUtil.fileExists(this.credentialsFilePath)) {
      return
    }

    await this.fsUtil.writeFile(this.credentialsFilePath, yaml.dump(ConfigYamlTemplate))
  }

  // create folder src/Files/Database_${databaseid}
  public async createDatabaseFolderInFiles(databaseId: string): Promise<void> {
    return this.fsUtil.mkdir(this.getDatabaseFilesDirectoryPath(databaseId), {
      recursive: true,
    })
  }

  // create folder src/Object/Database_${databaseid}
  public async createDatabaseFolderInObjects(databaseId: string): Promise<void> {
    return this.fsUtil.mkdir(this.getDatabaseObjectsDirectoryPath(databaseId), {
      recursive: true,
    })
  }

  public async createPackageJson(
    name: string = DEFAULT_NAME,
    description: string = DEFAULT_DESCRIPTION,
  ): Promise<void> {
    const packageJson = {
      description,
      keywords: [],
      name,
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
      version: DEFAULT_VERSION,
    }
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (this.fsUtil.fileExists(packageJsonPath)) {
      throw new Error(
        'package.json already exists in the current directory. Please change the directory or remove the existing package.json file',
      )
    }

    await this.fsUtil.writeFile(packageJsonPath, JSON.stringify(packageJson, undefined, 2))
  }

  public async ensureRootDirectoryStructure(): Promise<void> {
    await this.fsUtil.mkdir(this.objectsPath, {recursive: true})
    await this.fsUtil.mkdir(this.filesPath, {recursive: true})
  }

  public getCredentialsPath(): string {
    return this.credentialsFilePath
  }

  // TODO: make private
  public getDatabaseFilesDirectoryPath(databaseId: string): string {
    return path.join(this.filesPath, `Database_${databaseId}`)
  }

  public getDatabaseObjectsDirectoryPath(databaseId: string): string {
    return path.join(this.objectsPath, `Database_${databaseId}`)
  }

  public getDbBackgroundImagePath(databaseId: string): string {
    return path.join(this.getDatabaseFilesDirectoryPath(databaseId), DB_BACKGROUND_FILE_NAME)
  }

  public getFilePath(databaseId: string, objectName: string): string {
    if (!fs.existsSync(this.getDatabaseFilesDirectoryPath(databaseId))) {
      throw new Error('File path not set')
    }

    return path.join(this.getDatabaseFilesDirectoryPath(databaseId), `${objectName}.yaml`)
  }

  public getFilesPath(): string {
    return this.filesPath
  }

  public getObjectPath(databaseId: string, objectName: string): string {
    const databaseFolderPath = this.getDatabaseObjectsDirectoryPath(databaseId)
    if (!this.fsUtil.fileExists(databaseFolderPath)) {
      throw new Error(`Database folder not found: ${databaseFolderPath}`)
    }

    return path.join(this.getDatabaseObjectsDirectoryPath(databaseId), `${objectName}.yaml`)
  }

  public getObjectsPath(): string {
    return this.objectsPath
  }

  public async initialiseProject(name: string): Promise<void> {
    await this.createPackageJson(name)
    await this.createConfigYaml()
    await this.ensureRootDirectoryStructure()
  }

  public isDbBackgroundImageExist(databaseId: string, imagePath?: string): boolean {
    const backgroundFilePath = imagePath ?? this.getDbBackgroundImagePath(databaseId)
    return fs.existsSync(backgroundFilePath)
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
    const databaseConfigInYaml = await this.readDBConfig(this.getDatabaseObjectsDirectoryPath(databaseId))
    const databaseConfig = this.parseDatabaseConfigsbaseConfigFileContentFromYaml(databaseConfigInYaml)
    const parsedDBConfig = this.parseDatabaseConfigsbaseAndSchemaFromFileContent(databaseConfig)
    return parsedDBConfig
  }

  public async readDBConfig(databaseFolderPath: string): Promise<DBConfigsYaml> {
    if (!this.fsUtil.fileExists(databaseFolderPath)) {
      throw new Error(`Database folder not found: ${databaseFolderPath}`)
    }

    const files = await fsAsync.readdir(databaseFolderPath)
    const databaseFile = files.find((file) => file.startsWith('Database_'))
    if (!databaseFile) {
      throw new Error('Database file not found')
    }

    const database = await fsAsync.readFile(path.join(databaseFolderPath, databaseFile), 'utf8')
    const tableFiles = files.filter((file) => file.startsWith('Table_') || file.startsWith('Page_'))

    const tables = await Promise.all(
      tableFiles.map((table) => fsAsync.readFile(path.join(databaseFolderPath, table), 'utf8')),
    )
    return {
      database,
      tables,
    } satisfies DBConfigsYaml
  }

  public async readDBConfigFromFiles(databaseId: string): Promise<DBConfigsYaml> {
    return this.readDBConfig(this.getDatabaseObjectsDirectoryPath(databaseId))
  }

  // Write the database, schema and tables to their respective files
  public async writeDatabaseToFiles(
    database: DatabaseType,
    schema: DatabaseSchemaBaseType,
    tables: TableFileType[],
  ): Promise<void> {
    await this.ensureRootDirectoryStructure()
    // Create a subfolder in the root directory/Objects with name Database_${id}
    await this.createDatabaseFolderInObjects(database.id)
    await this.fsUtil.writeFile(
      this.getObjectPath(database.id, this.fsUtil.getObjectFileName('Database', database.settings.name)),
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
        this.getObjectPath(
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
