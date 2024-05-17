import {DatabaseMetadata, DatabaseSchemaType, DatabaseType, GetDatabaseResponse} from '../common/schema-validators.js'
import {NinoxClient} from '../utils/ninox-client.js'

export class DatabaseService {
  protected databaseId?: string
  protected ninoxClient: NinoxClient
  protected workspaceId: string

  public constructor(ninoxClient: NinoxClient, workspaceId: string, databaseId?: string) {
    this.ninoxClient = ninoxClient
    this.workspaceId = workspaceId
    this.databaseId = databaseId
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

  public async listDatabases(): Promise<DatabaseMetadata[]> {
    return this.ninoxClient.listDatabases()
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
