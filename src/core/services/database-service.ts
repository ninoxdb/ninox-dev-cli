import {DatabaseMetadata, DatabaseSchemaType, DatabaseType, Report, ViewType} from '../common/schema-validators.js'
import {ContextOptions, View} from '../common/types.js'
import {NinoxClient} from '../utils/ninox-client.js'
import {INinoxObjectService, IProjectService} from './interfaces.js'

export class DatabaseService implements INinoxObjectService<DatabaseMetadata> {
  protected ninoxClient: NinoxClient
  protected ninoxProjectService: IProjectService
  private databaseId?: string
  private databaseName!: string
  private debug: (message: string) => void

  public constructor(
    ninoxProjectService: IProjectService,
    ninoxClient: NinoxClient,
    context: ContextOptions,
    databaseId?: string,
  ) {
    this.ninoxProjectService = ninoxProjectService
    this.ninoxClient = ninoxClient
    this.databaseId = databaseId
    const {debug} = context
    this.debug = debug
  }

  public async download(): Promise<void> {
    if (!this.databaseId) throw new Error('Database ID is required to download the database')
    const {databaseId, ninoxClient, ninoxProjectService} = this
    this.debug(`Downloading database schema ${databaseId}...`)
    const {database: databaseJSON, schema: schemaJSON} = await this.getDatabaseMetadataAndSchema(databaseId)
    this.databaseName = databaseJSON.settings.name
    this.debug(`Database ${databaseJSON.settings.name} downloaded. Parsing schema...`)

    this.debug('Downloading views...')
    const viewsJSON = await this.getDatabaseViews(databaseId)

    const reportsJSON = await this.getDatabaseReports(databaseId)

    const {database, reports, schema, tables, views} = ninoxProjectService.parseDatabaseConfigs(
      databaseJSON,
      schemaJSON,
      viewsJSON,
      reportsJSON,
    )
    this.debug(`Writing Database ${database.settings.name} to files...`)
    await ninoxProjectService.writeDatabaseToFiles(database, schema, tables, views, reports)
    this.debug(`Downloading background image for Database ${database.settings.name}...`)
    await ninoxProjectService.createDatabaseFolderInFiles()
    await ninoxClient.downloadDatabaseBackgroundImage(databaseId, ninoxProjectService.getDbBackgroundImagePath())
  }

  public getDBId(): string {
    if (!this.databaseId) throw new Error('Database ID is not set')
    return this.databaseId
  }

  public getDBName(): string {
    return this.databaseName
  }

  public async list(): Promise<DatabaseMetadata[]> {
    return this.ninoxClient.listDatabases()
  }

  public async upload(): Promise<void> {
    const {ninoxProjectService} = this
    const {
      database: databaseLocal,
      reports: reportsLocal,
      tables,
      views: viewsLocal,
    } = await ninoxProjectService.readDBConfig()

    this.debug(
      `Uploading database tables: ${tables.length} views: ${viewsLocal.length} reports: ${reportsLocal.length} found.`,
    )
    const [database, schema, views, reports] = ninoxProjectService.parseLocalObjectsToNinoxObjects({
      database: databaseLocal,
      reports: reportsLocal,
      tables,
      views: viewsLocal,
    })
    await this.uploadDatabase(database, schema, views, reports)
  }

  public async uploadDatabase(
    database: DatabaseType,
    schema: DatabaseSchemaType,
    views: ViewType[],
    reports: Report[],
  ): Promise<void> {
    if (!this.databaseId) throw new Error('Database ID is required to upload the database')
    const isUploaded = await this.ninoxClient.uploadDatabaseBackgroundImage(
      this.databaseId,
      this.ninoxProjectService.getDbBackgroundImagePath(),
      this.ninoxProjectService.isDbBackgroundImageExist(),
    )
    // TODO: Later on, may be it is better to allow the ninox developer to decide whether to set the background type to image or not, regardless of whether there is a background.jpg file
    // If there was no background earlier, and now there is one, set the database background type to image
    if (isUploaded) {
      database.settings.bgType = 'image'
      database.settings.backgroundClass = 'background-file'
    }

    await this.ninoxClient.patchDatabaseSchemaInNinox(database.id, schema)
    await this.ninoxClient.updateDatabaseSettingsInNinox(database.id, database.settings)
    await this.ninoxClient.updateDatabaseViewsInNinox(database.id, views)
    await this.ninoxClient.updateDatabaseReportsInNinox(database.id, reports)
  }

  private async getDatabaseMetadataAndSchema(
    id: string,
  ): Promise<{database: DatabaseType; schema: DatabaseSchemaType}> {
    const databaseData = await this.ninoxClient.getDatabase(id)
    const {schema, ...databaseSettings} = databaseData
    return {database: {id, ...databaseSettings}, schema} as {database: DatabaseType; schema: DatabaseSchemaType}
  }

  private async getDatabaseReports(id: string): Promise<Report[]> {
    // TODO: check how to download all Reports at once
    const reports = await this.ninoxClient.listDatabaseReports(id)
    return Promise.all(reports.map((report) => this.ninoxClient.getDatabaseReport(id, report.id)))
  }

  private async getDatabaseViews(databaseId: string): Promise<View[]> {
    const viewsList = await this.ninoxClient.listDatabaseViews(databaseId)
    const views = viewsList.map((view) => this.ninoxClient.getDatabaseView(databaseId, view.id))
    return Promise.all(views)
  }
}
