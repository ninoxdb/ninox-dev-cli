import {DatabaseMetadata, DatabaseSchemaType, DatabaseType} from '../common/schema-validators.js'
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
    // download views
    const viewsJSON = await this.downloadDatabaseViews(id)

    // download reports

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
    // download reports
  }

  public async list(): Promise<DatabaseMetadata[]> {
    return this.ninoxClient.listDatabases()
  }

  public async upload(id: string): Promise<void> {
    const {database, schema} = await this.ninoxProjectService.readDatabaseConfigFromFiles(id)
    const bgImagePath = this.ninoxProjectService.getDbBackgroundImagePath(id)
    await this.uploadDatabase(
      database,
      schema,
      bgImagePath,
      this.ninoxProjectService.isDbBackgroundImageExist(id, bgImagePath),
    )
  }

  public async uploadDatabase(
    database: DatabaseType,
    schema: DatabaseSchemaType,
    backgroundImagePath: string,
    backgroundImageExists: boolean,
  ): Promise<void> {
    const isUploaded = await this.ninoxClient.uploadDatabaseBackgroundImage(
      database.id,
      backgroundImagePath,
      backgroundImageExists,
    )
    // If there was no background earlier, and now there is one, set the database background type to image
    // TODO: Later on, may be it is better to allow the developer to decide whether to set the background type to image or not, regardless of whether there is a background.jpg file
    if (isUploaded) {
      database.settings.bgType = 'image'
      database.settings.backgroundClass = 'background-file'
    }

    await this.ninoxClient.updateDatabaseSettings(database.id, database.settings)
    await this.ninoxClient.uploadDatabaseSchemaToNinox(database.id, schema)
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
