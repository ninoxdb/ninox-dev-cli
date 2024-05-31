import {DatabaseMetadata, DatabaseSchemaType, DatabaseType, ViewType} from '../common/schema-validators.js'
import {View} from '../common/types.js'
import {NinoxClient} from '../utils/ninox-client.js'
import {INinoxObjectService, IProjectService} from './interfaces.js'

export class DatabaseService implements INinoxObjectService<DatabaseMetadata> {
  protected ninoxClient: NinoxClient
  protected ninoxProjectService: IProjectService
  protected workspaceId: string
  private debug: (message: string) => void

  public constructor(
    ninoxProjectService: IProjectService,
    ninoxClient: NinoxClient,
    workspaceId: string,
    debugLogger: (message: string) => void,
  ) {
    this.ninoxProjectService = ninoxProjectService
    this.ninoxClient = ninoxClient
    this.workspaceId = workspaceId
    this.debug = debugLogger
  }

  public async download(id: string): Promise<void> {
    this.debug(`Downloading database schema ${id}...`)
    const {database: databaseJSON, schema: schemaJSON} = await this.getDatabaseMetadataAndSchema(id)
    this.debug(`Database ${databaseJSON.settings.name} downloaded. Parsing schema...`)

    this.debug('Downloading views...')
    const viewsJSON = await this.downloadDatabaseViews(id)

    // TODO: download reports
    const {database, schema, tables, views} = this.ninoxProjectService.parseDatabaseConfigs(
      databaseJSON,
      schemaJSON,
      viewsJSON,
    )
    this.debug(`Writing Database ${database.settings.name} to files...`)
    await this.ninoxProjectService.writeDatabaseToFiles(database, schema, tables, views)
    await this.ninoxProjectService.createDatabaseFolderInFiles(id)
    this.debug(`Downloading background image for Database ${database.settings.name}...`)
    await this.ninoxClient.downloadDatabaseBackgroundImage(id, this.ninoxProjectService.getDbBackgroundImagePath(id))
  }

  public async list(): Promise<DatabaseMetadata[]> {
    return this.ninoxClient.listDatabases()
  }

  public async upload(id: string): Promise<void> {
    // read raw data from local files
    const {database: databaseLocal, tables, views: viewsLocal} = await this.ninoxProjectService.readDBConfig(id)

    this.debug(`Uploading database ${databaseLocal}..${tables.length}...${viewsLocal.length} views found.`)
    const [database, schema, views] = this.ninoxProjectService.parseLocalObjectsToNinoxObjects({
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
