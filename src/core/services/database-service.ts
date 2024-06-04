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
    const viewsJSON = await this.downloadDatabaseViews(databaseId)

    // TODO: download reports
    const {database, schema, tables, views} = ninoxProjectService.parseDatabaseConfigs(
      databaseJSON,
      schemaJSON,
      viewsJSON,
    )
    this.debug(`Writing Database ${database.settings.name} to files...`)
    await ninoxProjectService.writeDatabaseToFiles(database, schema, tables, views)
    await ninoxProjectService.createDatabaseFolderInFiles(databaseId)
    this.debug(`Downloading background image for Database ${database.settings.name}...`)
    await ninoxClient.downloadDatabaseBackgroundImage(
      databaseId,
      ninoxProjectService.getDbBackgroundImagePath(databaseId),
    )
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
    // read raw data from local files
    const {databaseId, ninoxProjectService} = this
    const {database: databaseLocal, tables, views: viewsLocal} = await ninoxProjectService.readDBConfig(databaseId)

    this.debug(`Uploading database ${databaseLocal}..${tables.length}...${viewsLocal.length} views found.`)
    const [database, schema, views] = ninoxProjectService.parseLocalObjectsToNinoxObjects({
      database: databaseLocal,
      tables,
      views: viewsLocal,
    })
    await this.uploadDatabase(database, schema, views)
  }

  public async uploadDatabase(database: DatabaseType, schema: DatabaseSchemaType, views: ViewType[]): Promise<void> {
    // TODO: make sure that folder exists before downloading
    const bgImagePath = this.ninoxProjectService.getDbBackgroundImagePath(database.id)
    const isUploaded = await this.ninoxClient.uploadDatabaseBackgroundImage(
      database.id,
      bgImagePath,
      this.ninoxProjectService.isDbBackgroundImageExist(database.id, bgImagePath),
    )
    // If there was no background earlier, and now there is one, set the database background type to image
    // TODO: Later on, may be it is better to allow the developer to decide whether to set the background type to image or not, regardless of whether there is a background.jpg file
    if (isUploaded) {
      database.settings.bgType = 'image'
      database.settings.backgroundClass = 'background-file'
    }

    await this.ninoxClient.uploadDatabaseSchemaToNinox(database.id, schema)
    await this.ninoxClient.updateDatabaseSettings(database.id, database.settings)
    await Promise.all(views.map((view) => this.ninoxClient.uploadDatabaseView(database.id, view)))
  }

  private async downloadDatabaseViews(databaseId: string): Promise<View[]> {
    const viewsList = await this.ninoxClient.listDatabaseViews(databaseId)
    const views = viewsList.map((view) => this.ninoxClient.getDatabaseView(databaseId, view.id))
    return Promise.all(views)
  }

  private async getDatabaseMetadataAndSchema(
    id: string,
  ): Promise<{database: DatabaseType; schema: DatabaseSchemaType}> {
    const databaseData = await this.ninoxClient.getDatabase(id)
    const {schema, ...databaseSettings} = databaseData
    return {database: {id, ...databaseSettings}, schema} as {database: DatabaseType; schema: DatabaseSchemaType}
  }
}
