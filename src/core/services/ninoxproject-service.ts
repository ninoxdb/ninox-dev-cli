import * as yaml from 'js-yaml'
import fs from 'node:fs'
import * as fsAsync from 'node:fs/promises'
import path from 'node:path'

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
  Report,
  ReportTypeFile,
  TableBase,
  TableFile,
  TableFileType,
  ViewSchemaFile,
  ViewType,
  ViewTypeFile,
  ViewTypeSchema,
  reportFileSchema,
  reportSchema,
} from '../common/schema-validators.js'
import {ContextOptions, DBConfigsYaml, TableFolderContent, View} from '../common/types.js'
import {FSUtil} from '../utils/fs.js'
import {IProjectService} from './interfaces.js'

export class NinoxProjectService implements IProjectService {
  private credentialsFilePath: string
  private databaseFilesPath: string
  private databaseId: string
  private databaseObjectsPath: string
  private dbBackgroundImagePath: string
  private debug: (message: string) => void
  private filesBasePath: string
  private fsUtil: FSUtil
  private objectsBasePath: string

  public constructor(
    fsUtil: FSUtil,
    databaseId: string,
    context: ContextOptions,
    private basePath: string = process.cwd(),
  ) {
    this.fsUtil = fsUtil
    this.credentialsFilePath = path.join(this.basePath, CREDENTIALS_FILE_NAME)
    this.filesBasePath = path.join(this.basePath, 'src', 'Files')
    this.objectsBasePath = path.join(this.basePath, 'src', 'Objects')
    this.databaseObjectsPath = path.join(this.objectsBasePath, `database_${databaseId}`)
    this.databaseFilesPath = path.join(this.filesBasePath, `database_${databaseId}`)
    this.dbBackgroundImagePath = path.join(this.getDatabaseFilesPath(), DB_BACKGROUND_FILE_NAME)
    this.databaseId = databaseId
    const {debug} = context
    this.debug = debug
  }

  public async createConfigYaml(): Promise<void> {
    if (this.fsUtil.fileExists(this.credentialsFilePath)) {
      return
    }

    await this.fsUtil.writeFile(this.credentialsFilePath, yaml.dump(ConfigYamlTemplate))
  }

  // create folder src/Files/Database_${databaseid}
  public async createDatabaseFolderInFiles(): Promise<void> {
    return this.fsUtil.mkdir(this.getDatabaseFilesPath(), {
      recursive: true,
    })
  }

  // create folder src/Object/Database_${databaseid}
  public async createDatabaseFolderInObjects(): Promise<string> {
    await this.fsUtil.mkdir(this.databaseObjectsPath, {
      recursive: true,
    })
    return this.databaseObjectsPath
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
    await this.fsUtil.mkdir(this.objectsBasePath, {recursive: true})
    await this.fsUtil.mkdir(this.filesBasePath, {recursive: true})
  }

  public getCredentialsPath(): string {
    return this.credentialsFilePath
  }

  public getDatabaseFilesPath(): string {
    return this.databaseFilesPath
  }

  public getDatabaseObjectsPath(): string {
    return this.databaseObjectsPath
  }

  public getDbBackgroundImagePath(): string {
    return this.dbBackgroundImagePath
  }

  public getFilePath(databaseId: string, objectName: string): string {
    if (!fs.existsSync(this.databaseFilesPath)) {
      throw new Error('Database folder not found')
    }

    return path.join(this.databaseFilesPath, `${objectName}.yaml`)
  }

  public getFilesPath(): string {
    return this.filesBasePath
  }

  public getObjectPath(objectName: string): string {
    if (!this.fsUtil.fileExists(this.databaseObjectsPath)) {
      throw new Error(`Database folder not found: ${this.databaseObjectsPath}`)
    }

    return path.join(this.databaseObjectsPath, `${objectName}.yaml`)
  }

  public getObjectsBasePath(): string {
    return this.objectsBasePath
  }

  public async initialiseProject(name: string): Promise<void> {
    await this.createPackageJson(name)
    await this.createConfigYaml()
    await this.ensureRootDirectoryStructure()
  }

  public isDbBackgroundImageExist(): boolean {
    return fs.existsSync(this.dbBackgroundImagePath)
  }

  public parseDatabaseConfigs(
    database_: unknown,
    schema_: unknown,
    views_: View[],
    reports_: Report[],
  ): {
    database: DatabaseType
    reports: ReportTypeFile[]
    schema: DatabaseSchemaBaseType
    tables: TableFileType[]
    views: ViewTypeFile[]
  } {
    const parsedDatabase = this.parseDatabaseMetadata(database_)

    const parsedSchema = this.parseDatabaseSchema(schema_)

    const schemaWithoutTypes = this.parseDatabaseSchemaWithoutTypes(parsedSchema)
    const {types} = parsedSchema

    const tables = Object.entries(types).map(([key, value]) => {
      const parsedTable = TableBase.safeParse(value)
      if (!parsedTable.success) throw new Error(`Validation errors: Table validation failed ${types[key]?.caption}`)
      return TableFile.parse({
        table: {
          ...parsedTable.data,
          _database: parsedDatabase.id,
          _id: key,
        },
      })
    })

    // parse views
    const views = views_
      .map((view: View) => {
        const parsedView = ViewSchemaFile.safeParse({
          view: {...view, _database: parsedDatabase.id, _table: types[view.type]?.caption ?? view.type},
        })
        if (!parsedView.success) {
          throw new Error('Validation errors: View validation failed')
        }

        return parsedView.data
      })
      // filter out orphan views
      .filter((view) => types[view.view.config.type])

    // parse reports
    const reports = reports_
      .map((report) => {
        const parsedReport = reportFileSchema.safeParse({report: {...report, _database: parsedDatabase.id}})
        if (!parsedReport.success) {
          this.debug(`Validation errors: Report validation failed ${report.caption}`)
          return
        }

        return parsedReport.data
      })
      .filter(Boolean) as ReportTypeFile[]

    return {database: parsedDatabase, reports, schema: schemaWithoutTypes, tables, views}
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

  /**
   *
   * @param dBConfigsYaml database, tables, views in yaml string format
   * @returns 1. Parse file content to local objects 2. Parse local objects to Ninox objects 3. Return Ninox objects
   */
  public parseLocalObjectsToNinoxObjects(
    dBConfigsYaml: DBConfigsYaml,
  ): [database: DatabaseType, schema: DatabaseSchemaType, views: ViewType[], reports: Report[]] {
    // const databaseConfig = this.parseDatabaseConfigsbaseConfigFileContentFromYaml(dBConfigsYaml)
    const {database: databaseFileContent, reports: reportsFileContent, tables, views: viewsFileContent} = dBConfigsYaml
    const databaseLocal = yaml.load(databaseFileContent) as DatabaseFileType
    const tablesLocal = tables.map((table) => yaml.load(table) as TableFileType)
    const viewsLocal = viewsFileContent.map((view) => yaml.load(view) as ViewTypeFile)
    const reportsLocal = reportsFileContent.map((report) => yaml.load(report) as ReportTypeFile)
    const {database: databaseJSON} = databaseLocal
    const {schema: schemaLocalJSON} = databaseJSON

    const tablesJSON = tablesLocal.map((table) => table.table)

    const schemaJSON: DatabaseSchemaType = {
      ...schemaLocalJSON,
      types: {},
    }
    // attach the tables to the schema
    for (const table of tablesJSON) {
      schemaJSON.types[table._id] = table
    }

    const database = Database.parse(databaseJSON)
    const schema = DatabaseSchema.parse(schemaJSON)

    const views = viewsLocal.map((viewLocal) => {
      const {view} = viewLocal
      const parsedView = ViewTypeSchema.safeParse(view)
      if (!parsedView.success) {
        throw new Error('Validation errors: View validation failed')
      }

      return parsedView.data
    })

    const reports = reportsLocal.map((reportLocal) => {
      const {report} = reportLocal
      const parsedReport = reportSchema.safeParse(report)
      if (!parsedReport.success) {
        throw new Error('Validation errors: Report validation failed')
      }

      return parsedReport.data
    })

    return [database, schema, views, reports]
  }

  public async readDatabaseConfigFromFiles(): Promise<{database: DatabaseType; schema: DatabaseSchemaType}> {
    const databaseConfigInYaml = await this.readDBConfig()
    const databaseConfig = this.parseDatabaseConfigsbaseConfigFileContentFromYaml(databaseConfigInYaml)
    const parsedDBConfig = this.parseDatabaseConfigsbaseAndSchemaFromFileContent(databaseConfig)
    return parsedDBConfig
  }

  public async readDBConfig(): Promise<DBConfigsYaml> {
    const {fsUtil} = this
    const databaseObjectsPath = this.getDatabaseObjectsPath()
    if (!fsUtil.fileExists(databaseObjectsPath)) {
      throw new Error(`Database folder not found: ${databaseObjectsPath}`)
    }

    const databaseFolderObjects = await fsAsync.readdir(databaseObjectsPath)
    const databaseFile = databaseFolderObjects.find((file) => file.startsWith(`database_`))
    const database = await this.readDatabaseFile(databaseFile as string)

    // Filter table files
    const tableFolders = databaseFolderObjects.filter((file) => file.startsWith('table_') || file.startsWith('page_'))

    // Helper function to process a single folder

    // Create an array of promises to process each folder concurrently
    const processPromises = tableFolders.map((folderPath) =>
      this.processTableFolder(path.join(databaseObjectsPath, folderPath)),
    )

    // Await all the folder processing promises
    const tableFoldersContent = await Promise.all(processPromises)
    const tableFiles: string[] = []
    const viewFiles: string[] = []
    const reportFiles: string[] = []
    for (const folderContent of tableFoldersContent) {
      tableFiles.push(folderContent.table)
      viewFiles.push(...folderContent.views)
      reportFiles.push(...folderContent.reports)
    }

    return {
      database,
      reports: reportFiles,
      tables: tableFiles,
      views: viewFiles,
    } satisfies DBConfigsYaml
  }

  // Write the database, schema and tables to their respective files
  // eslint-disable-next-line max-params
  public async writeDatabaseToFiles(
    database: DatabaseType,
    schema: DatabaseSchemaBaseType,
    tables: TableFileType[],
    views: ViewTypeFile[],
    reports: ReportTypeFile[],
  ): Promise<void> {
    await this.ensureRootDirectoryStructure()
    // Create a subfolder in the root directory/Objects with name Database_${id}
    await this.createDatabaseFolderInObjects()

    await this.writeDatabaseFile(database, schema)
    // table
    const tableFolders = await this.writeTablesToFiles(tables)

    // group views by table
    const viewsByTable: Record<string, ViewTypeFile[]> = {}
    for (const view of views) {
      // filter orphan views
      if (!tableFolders[view.view.type]) {
        continue
      }

      if (!viewsByTable[view.view.type]) {
        viewsByTable[view.view.type] = []
      }

      viewsByTable[view.view.type].push(view)
    }

    await this.writeViewsToFiles(viewsByTable, tableFolders)

    // group reports by table
    const reportsByTable: Record<string, ReportTypeFile[]> = {}
    for (const reportFile of reports) {
      // filter orphan views
      if (!tableFolders[reportFile.report.tid]) {
        continue
      }

      if (!reportsByTable[reportFile.report.tid]) {
        reportsByTable[reportFile.report.tid] = []
      }

      reportsByTable[reportFile.report.tid].push(reportFile)
    }

    // reports
    await this.writeReportsToFiles(reportsByTable, tableFolders)
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

  private parseDatabaseMetadata(database: unknown): DatabaseType {
    const parsedDatabase = Database.safeParse(database)
    if (!parsedDatabase.success) {
      throw new Error('Validation errors: Database validation failed')
    }

    return parsedDatabase.data
  }

  private parseDatabaseSchema(schema: unknown): DatabaseSchemaType {
    const parsedSchema = DatabaseSchema.safeParse(schema)
    if (!parsedSchema.success) {
      throw new Error('Validation errors: Schema validation failed')
    }

    return parsedSchema.data
  }

  private parseDatabaseSchemaWithoutTypes(schema: unknown): DatabaseSchemaBaseType {
    const parsedSchema = DatabaseSchemaBase.safeParse(schema)
    if (!parsedSchema.success) {
      throw new Error('Validation errors: Schema validation failed')
    }

    return parsedSchema.data
  }

  private async processTableFolder(folderPath: string): Promise<TableFolderContent> {
    const {fsUtil} = this
    const files = await fs.promises.readdir(folderPath)

    const tableFileName = files.find((file) => file.startsWith('table_') || file.startsWith('page_'))
    if (!tableFileName) {
      throw new Error(`Table file not found ${folderPath}`)
    }

    const tableFilePath = path.join(folderPath, tableFileName)
    let tableFileContent = ''
    if (await fsUtil.checkFileExists(tableFilePath)) {
      tableFileContent = await fsUtil.readFile(tableFilePath)
    }

    const viewFilesPromises = files
      .filter((file) => file.startsWith('view_'))
      .map(async (file) => {
        const content = await fsUtil.readFile(path.join(folderPath, file))
        return content
      })

    const reportFilesPromises = files
      .filter((file) => file.startsWith('report_'))
      .map(async (file) => {
        const content = await fsUtil.readFile(path.join(folderPath, file))
        return content
      })

    const viewContents = await Promise.all(viewFilesPromises)
    const reportContents = await Promise.all(reportFilesPromises)

    return {
      reports: reportContents,
      table: tableFileContent,
      views: viewContents,
    }
  }

  private async readDatabaseFile(databaseFile: string): Promise<string> {
    if (!databaseFile) {
      throw new Error('Database file not found')
    }

    return fsAsync.readFile(path.join(this.databaseObjectsPath, databaseFile), 'utf8')
  }

  private async writeDatabaseFile(database: DatabaseType, schema: DatabaseSchemaBaseType): Promise<void> {
    const databaseFilePath = path.join(
      this.getDatabaseObjectsPath(),
      `${this.fsUtil.formatObjectFilename('database', database.settings.name)}.yaml`,
    )
    await this.fsUtil.writeFile(
      databaseFilePath,
      yaml.dump(
        DatabaseFile.parse({
          database: {
            ...database,
            schema: {...schema, _database: database.id},
          },
        }),
      ),
    )
  }

  private async writeReportsToFiles(
    reports: Record<string, ReportTypeFile[]>,
    tableFolders: Record<string, string>,
  ): Promise<void> {
    // TODO: check why report also contains view like structures for some databases e.g hrm
    const directoryPromises = Object.entries(reports).map(async ([, reports]) => {
      // assume that the table folder exists if defined
      const fileWritingPromises = reports.map((report) => {
        const tablePath = tableFolders[report.report.tid]

        const reportFileName = `${this.fsUtil.formatObjectFilename('report', report.report.caption)}.yaml`
        return this.fsUtil.writeFile(path.join(tablePath, reportFileName), yaml.dump(report))
      })

      // Wait for all file writing promises in this directory to resolve
      return Promise.all(fileWritingPromises)
    })
    await Promise.all(directoryPromises)
  }

  private async writeTablesToFiles(tables: TableFileType[]): Promise<Record<string, string>> {
    const tableFolders: Record<string, string> = {}
    const fileWritePromises = []
    for (const tableFileData of tables) {
      const tableFolderName = this.fsUtil.formatObjectFilename(
        tableFileData.table.kind ?? 'table',
        tableFileData.table.caption as string,
      )
      const tableFolderPath = path.join(this.getDatabaseObjectsPath(), tableFolderName)
      tableFolders[tableFileData.table._id] = tableFolderPath

      // create table folder
      // tableFolderCreationPromises.push(this.fsUtil.mkdir(tableFolderPath))
      fileWritePromises.push(
        this.fsUtil.mkdir(tableFolderPath).then(() => {
          // write table file
          this.fsUtil.writeFile(path.join(tableFolderPath, `${tableFolderName}.yaml`), yaml.dump(tableFileData))
        }),
      )
    }

    await Promise.all(fileWritePromises)
    return tableFolders
  }

  private async writeViewsToFiles(
    viewsByTable: Record<string, ViewTypeFile[]>,
    tableFolders: Record<string, string>,
  ): Promise<void> {
    const directoryPromises = Object.entries(viewsByTable).map(async ([, views]) => {
      // assume that the table folder exists if defined
      const fileWritingPromises = views.map((view) => {
        const tablePath = tableFolders[view.view.type]

        const viewFileName = `${this.fsUtil.formatObjectFilename('view', view.view.caption)}.yaml`
        return this.fsUtil.writeFile(path.join(tablePath, viewFileName), yaml.dump(view))
      })

      // Wait for all file writing promises in this directory to resolve
      return Promise.all(fileWritingPromises)
    })

    // Wait for all directory creation and file writing promises to resolve
    await Promise.all(directoryPromises)
  }
}
