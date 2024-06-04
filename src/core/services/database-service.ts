import {DatabaseMetadata, DatabaseSchemaType, DatabaseType, ViewType} from '../common/schema-validators.js'
import {View} from '../common/types.js'
import {NinoxClient} from '../utils/ninox-client.js'
import {INinoxObjectService, IProjectService} from './interfaces.js'

export class DatabaseService implements INinoxObjectService<DatabaseMetadata> {
  protected ninoxClient: NinoxClient
  protected ninoxProjectService: IProjectService
  private databaseId: string
  private databaseName!: string
  private debug: (message: string) => void

  public constructor(
    ninoxProjectService: IProjectService,
    ninoxClient: NinoxClient,
    databaseId: string,
    debugLogger: (message: string) => void,
  ) {
    this.ninoxProjectService = ninoxProjectService
    this.ninoxClient = ninoxClient
    this.databaseId = databaseId
    this.debug = debugLogger
  }

  public async download(): Promise<void> {
    const {databaseId, ninoxClient, ninoxProjectService} = this
    this.debug(`Downloading database schema ${databaseId}...`)
    const {database: databaseJSON, schema: schemaJSON} = await this.getDatabaseMetadataAndSchema(databaseId)
    this.databaseName = databaseJSON.settings.name
    this.debug(`Database ${databaseJSON.settings.name} downloaded. Parsing schema...`)

    this.debug('Downloading views...')
    const viewsJSON = await this.getDatabaseViews(databaseId)

    const reports = await this.getDatabaseReports(databaseId)

    const {database, schema, tables, views} = ninoxProjectService.parseDatabaseConfigs(
      databaseJSON,
      schemaJSON,
      viewsJSON,
    )
    this.debug(`Writing Database ${database.settings.name} to files...`)
    await ninoxProjectService.writeDatabaseToFiles(database, schema, tables, views, reports)
    this.debug(`Downloading background image for Database ${database.settings.name}...`)
    await ninoxProjectService.createDatabaseFolderInFiles()
    await ninoxClient.downloadDatabaseBackgroundImage(databaseId, ninoxProjectService.getDbBackgroundImagePath())
  }

  public getDBId(): string {
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
    reports: any[],
  ): Promise<void> {
    // TODO: make sure that folder exists before downloading
    const isUploaded = await this.ninoxClient.uploadDatabaseBackgroundImage(
      this.databaseId,
      this.ninoxProjectService.getDbBackgroundImagePath(),
      this.ninoxProjectService.isDbBackgroundImageExist(),
    )
    // If there was no background earlier, and now there is one, set the database background type to image
    // TODO: Later on, may be it is better to allow the developer to decide whether to set the background type to image or not, regardless of whether there is a background.jpg file
    if (isUploaded) {
      database.settings.bgType = 'image'
      database.settings.backgroundClass = 'background-file'
    }

    await this.ninoxClient.patchDatabaseSchemaInNinox(database.id, schema)
    await this.ninoxClient.updateDatabaseSettingsInNinox(database.id, database.settings)
    await this.ninoxClient.updateDatabaseViewsInNinox(database.id, views)
    await this.ninoxClient.updateDatabaseReportsInNinox(database.id, reports)
    // await Promise.all(views.map((view) => this.ninoxClient.updateDatabaseViewInNinox(database.id, view)))
  }

  private async getDatabaseMetadataAndSchema(
    id: string,
  ): Promise<{database: DatabaseType; schema: DatabaseSchemaType}> {
    const databaseData = await this.ninoxClient.getDatabase(id)
    const {schema, ...databaseSettings} = databaseData
    return {database: {id, ...databaseSettings}, schema} as {database: DatabaseType; schema: DatabaseSchemaType}
  }

  private async getDatabaseReports(id: string): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reports = (await this.ninoxClient.listDatabaseReports(id)) as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.all(reports.map((report: any) => this.ninoxClient.getDatabaseReport(id, report.id)))
  }

  private async getDatabaseViews(databaseId: string): Promise<View[]> {
    const viewsList = await this.ninoxClient.listDatabaseViews(databaseId)
    const views = viewsList.map((view) => this.ninoxClient.getDatabaseView(databaseId, view.id))
    return Promise.all(views)
  }
}
