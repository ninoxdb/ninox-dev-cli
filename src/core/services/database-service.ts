import {DatabaseMetadata, DatabaseSchemaType, DatabaseType, GetDatabaseResponse} from '../common/schema-validators.js'
import {NinoxClient} from '../utils/ninox-client.js'
import {NinoxProjectService} from './ninoxproject-service.js'

export class DatabaseService {
  protected databaseId?: string
  protected ninoxClient: NinoxClient
  protected ninoxProjectService: NinoxProjectService
  protected workspaceId: string

  public constructor(
    ninoxProjectService: NinoxProjectService,
    ninoxClient: NinoxClient,
    workspaceId: string,
    databaseId?: string,
  ) {
    this.ninoxProjectService = ninoxProjectService
    this.ninoxClient = ninoxClient
    this.workspaceId = workspaceId
    this.databaseId = databaseId
  }

  public async download(id: string): Promise<void> {
    const databaseData = await this.getDatabase(id)

    const {schema: schemaData, ...databaseRemainingData} = databaseData

    const {database, schema, tables} = this.ninoxProjectService.parseData({id, ...databaseRemainingData}, schemaData)
    await this.ninoxProjectService.writeToFiles(database, schema, tables)
    await this.ninoxProjectService.createDatabaseFolderInFiles(id)
    await this.downloadDatabaseBackgroundImage(id, this.ninoxProjectService.getDbBackgroundImagePath(id))
    // download views
    // download reports
  }

  public async downloadDatabaseBackgroundImage(
    databaseId: string = this.databaseId as string,
    imagePath: string,
  ): Promise<void> {
    return this.ninoxClient.downloadDatabaseBackgroundImage(databaseId, imagePath)
  }

  public async getDatabase(id: string): Promise<GetDatabaseResponse> {
    return this.ninoxClient.getDatabase(id)
  }

  public async list(): Promise<DatabaseMetadata[]> {
    return this.ninoxClient.listDatabases()
  }

  public async upload(id: string): Promise<void> {
    const {database, schema} = await this.ninoxProjectService.readDatabaseConfig(id)
    const bgImagePath = this.ninoxProjectService.getDbBackgroundImagePath(id)
    await this.uploadDatabase(
      database,
      schema,
      bgImagePath,
      this.ninoxProjectService.isDbBackgroundImageExists(id, bgImagePath),
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
}
