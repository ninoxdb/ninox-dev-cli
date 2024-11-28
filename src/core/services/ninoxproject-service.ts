import path from 'node:path'
import * as yaml from 'yaml'

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

const YAML_DEFAULT_OPTIONS = {lineWidth: -1}
export class NinoxProjectService implements IProjectService {
  private basePath: string = process.cwd()
  private credentialsFilePath: string
  private databaseFilesPath: string
  private databaseId?: string
  private databaseObjectsPath: string
  private dbBackgroundImagePath: string
  private debug: (message: string) => void
  private filesBasePath: string
  private fsUtil: FSUtil
  private objectsBasePath: string

  public constructor(fsUtil: FSUtil, context: ContextOptions, databaseId?: string) {
    this.fsUtil = fsUtil
    this.databaseId = databaseId
    this.credentialsFilePath = path.join(this.basePath, CREDENTIALS_FILE_NAME)
    this.filesBasePath = path.join(this.basePath, 'src', 'Files')
    this.objectsBasePath = path.join(this.basePath, 'src', 'Objects')
    this.databaseObjectsPath = path.join(this.objectsBasePath, `database_${databaseId}`)
    this.databaseFilesPath = path.join(this.filesBasePath, `database_${databaseId}`)
    this.dbBackgroundImagePath = path.join(this.databaseFilesPath, DB_BACKGROUND_FILE_NAME)
    const {debug} = context
    this.debug = debug
  }

  public async createConfigYaml(): Promise<void> {
    if (this.fsUtil.fileExists(this.credentialsFilePath)) {
      return
    }

    await this.fsUtil.writeFile(this.credentialsFilePath, yaml.stringify(ConfigYamlTemplate))
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
    if (!this.databaseId) throw new Error('Database ID is required for this operation.')
    return this.databaseFilesPath
  }

  public getDatabaseObjectsPath(): string {
    if (!this.databaseId) throw new Error('Database ID is required for this operation.')
    return this.databaseObjectsPath
  }

  public getDbBackgroundImagePath(): string {
    if (!this.databaseId) throw new Error('Database ID is required for this operation.')
    return this.dbBackgroundImagePath
  }

  public getReportFilesFolderPath(reportId: string): string {
    return path.join(this.getDatabaseFilesPath(), `report_${reportId}`)
  }

  public async initialiseProject(name: string): Promise<void> {
    await this.createPackageJson(name)
    await this.createConfigYaml()
    await this.ensureRootDirectoryStructure()
  }

  public isDbBackgroundImageExist(): boolean {
    return this.fsUtil.existsSync(this.dbBackgroundImagePath)
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
      const parsedTableResult = TableBase.safeParse(value)
      if (!parsedTableResult.success)
        throw new Error(
          `Validation errors: Table validation failed ${types[key]?.caption} ` +
            JSON.stringify(parsedTableResult.error),
        )
      const {data: parsedTable} = parsedTableResult
      for (const [fieldId, fieldConfig] of Object.entries(parsedTable.fields)) {
        const {caption} = fieldConfig
        delete parsedTable.fields[fieldId]
        delete fieldConfig.caption
        parsedTable.fields[caption] = {...fieldConfig, _id: fieldId}
      }

      for (const [fieldId, fieldConfig] of Object.entries(parsedTable.uis)) {
        const {caption} = fieldConfig
        delete parsedTable.uis[fieldId]
        delete fieldConfig.caption
        parsedTable.uis[caption] = {...fieldConfig, _id: fieldId}
      }

      return TableFile.parse({
        table: {
          ...parsedTable,
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
          throw new Error('Validation errors: View validation failed ' + JSON.stringify(parsedView.error))
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
          this.debug(
            `Validation errors: Report validation failed ${report.caption} ${JSON.stringify(parsedReport.error)}`,
          )
          return
        }

        return parsedReport.data
      })
      .filter(Boolean) as ReportTypeFile[]

    return {database: parsedDatabase, reports, schema: schemaWithoutTypes, tables, views}
  }

  /**
   *
   * @param dBConfigsYaml database, tables, views in yaml string format
   * @returns 1. Parse file content to local objects 2. Parse local objects to Ninox objects 3. Return Ninox objects
   */
  public parseLocalObjectsToNinoxObjects(
    dBConfigsYaml: DBConfigsYaml,
  ): [database: DatabaseType, schema: DatabaseSchemaType, views: ViewType[], reports: Report[]] {
    const {database: databaseFileContent, reports: reportsFileContent, tables, views: viewsFileContent} = dBConfigsYaml
    const databaseLocal = yaml.parse(databaseFileContent) as DatabaseFileType
    const tablesLocal = tables.map((table) => yaml.parse(table) as TableFileType)
    const viewsLocal = viewsFileContent.map((view) => yaml.parse(view) as ViewTypeFile)
    const reportsLocal = reportsFileContent.map((report) => yaml.parse(report) as ReportTypeFile)
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
      for (const [fieldName, fieldConfig] of Object.entries(table.fields)) {
        const {_id} = fieldConfig
        if (!_id) throw new Error(`Field _id is required ${table.caption + '.' + fieldName}`)
        delete table.fields[fieldName]
        table.fields[_id] = fieldConfig
        fieldConfig.caption = fieldName
      }

      for (const [fieldName, fieldConfig] of Object.entries(table.uis)) {
        const {_id} = fieldConfig
        if (!_id) throw new Error(`Field _id is required ${table.caption + '.' + fieldName}`)
        delete table.uis[fieldName]
        table.uis[_id] = fieldConfig
        fieldConfig.caption = fieldName
      }
    }

    const database = Database.parse(databaseJSON)
    const schema = DatabaseSchema.parse(schemaJSON)

    const views = viewsLocal.map((viewLocal) => {
      const {view} = viewLocal
      const parsedView = ViewTypeSchema.safeParse(view)
      if (!parsedView.success) {
        throw new Error(`Validation errors: View validation failed ${view.caption} ` + JSON.stringify(parsedView.error))
      }

      return parsedView.data
    })

    const reports = reportsLocal.map((reportLocal) => {
      const {report} = reportLocal
      const parsedReport = reportSchema.safeParse(report)
      if (!parsedReport.success) {
        throw new Error(
          `Validation errors: Report validation failed ${report.caption} ` + JSON.stringify(parsedReport.error),
        )
      }

      return parsedReport.data
    })

    return [database, schema, views, reports]
  }

  public async readDBConfig(): Promise<DBConfigsYaml> {
    const {fsUtil} = this
    const databaseObjectsPath = this.getDatabaseObjectsPath()
    if (!fsUtil.fileExists(databaseObjectsPath)) {
      throw new Error(`Database folder not found: ${databaseObjectsPath}`)
    }

    const databaseFolderObjects = await fsUtil.readdir(databaseObjectsPath)
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
  public async writeDatabaseFile(database: DatabaseType, schema: DatabaseSchemaBaseType): Promise<void> {
    const databaseFilePath = path.join(
      this.getDatabaseObjectsPath(),
      `${this.fsUtil.formatObjectFilename('database', database.settings.name)}.yaml`,
    )
    await this.fsUtil.writeFile(
      databaseFilePath,
      yaml.stringify(
        DatabaseFile.parse({
          database: {
            ...database,
            schema: {...schema, _database: database.id},
          },
        }),
        YAML_DEFAULT_OPTIONS,
      ),
    )
  }

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

  private parseDatabaseMetadata(database: DatabaseType): DatabaseType {
    const parsedDatabase = Database.safeParse(database)
    if (!parsedDatabase.success) {
      throw new Error(
        `Validation errors: Database validation failed ${database?.settings?.name} ` +
          JSON.stringify(parsedDatabase.error),
      )
    }

    return parsedDatabase.data
  }

  private parseDatabaseSchema(schema: unknown): DatabaseSchemaType {
    const parsedSchema = DatabaseSchema.safeParse(schema)
    if (!parsedSchema.success) {
      throw new Error('Validation errors: Schema validation failed ' + JSON.stringify(parsedSchema.error))
    }

    return parsedSchema.data
  }

  private parseDatabaseSchemaWithoutTypes(schema: unknown): DatabaseSchemaBaseType {
    const parsedSchema = DatabaseSchemaBase.safeParse(schema)
    if (!parsedSchema.success) {
      throw new Error('Validation errors: Schema validation failed ' + JSON.stringify(parsedSchema.error))
    }

    return parsedSchema.data
  }

  private async processTableFolder(folderPath: string): Promise<TableFolderContent> {
    const {fsUtil} = this
    const files = await fsUtil.readdir(folderPath)

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

    return this.fsUtil.readFile(path.join(this.databaseObjectsPath, databaseFile))
  }

  private async writeReportsToFiles(
    reports: Record<string, ReportTypeFile[]>,
    tableFolders: Record<string, string>,
  ): Promise<void> {
    const directoryPromises = Object.entries(reports).map(async ([, reports]) => {
      // assume that the table folder exists if defined
      const fileWritingPromises = reports.map((report) => {
        const tablePath = tableFolders[report.report.tid]

        const reportFileName = `${this.fsUtil.formatObjectFilename('report', report.report.caption)}.yaml`
        return this.fsUtil.writeFile(path.join(tablePath, reportFileName), yaml.stringify(report, YAML_DEFAULT_OPTIONS))
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
          this.fsUtil.writeFile(
            path.join(tableFolderPath, `${tableFolderName}.yaml`),
            yaml.stringify(tableFileData, YAML_DEFAULT_OPTIONS),
          )
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
        return this.fsUtil.writeFile(path.join(tablePath, viewFileName), yaml.stringify(view, YAML_DEFAULT_OPTIONS))
      })

      // Wait for all file writing promises in this directory to resolve
      return Promise.all(fileWritingPromises)
    })

    // Wait for all directory creation and file writing promises to resolve
    await Promise.all(directoryPromises)
  }
}
