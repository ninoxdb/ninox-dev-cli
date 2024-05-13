import {DatabaseMetadata, DatabaseSchemaType, DatabaseType} from '../common/schemas.js'
import {NinoxClient} from '../utils/ninox-client.js'

export class DatabaseService {
  protected databaseId?: string
  protected ninoxClient: NinoxClient
  protected workspaceId: string

  constructor(ninoxClient: NinoxClient, workspaceId: string, databaseId?: string) {
    this.ninoxClient = ninoxClient
    this.workspaceId = workspaceId
    this.databaseId = databaseId
  }

  async downloadDatabaseBackgroundImage() {
    return this.ninoxClient.downloadDatabaseBackgroundImage(this.databaseId as string)
  }

  async getDatabase(id: string) {
    return this.ninoxClient.getDatabase(id)
  }

  async listDatabases() {
    return this.ninoxClient.listDatabases() as Promise<DatabaseMetadata[]>
  }

  public async uploadDatabase(database: DatabaseType, schema: DatabaseSchemaType) {
    const isUploaded = await this.ninoxClient.uploadDatabaseBackgroundImage(database.id)
    if (isUploaded) {
      database.settings.bgType = 'image'
      database.settings.backgroundClass = 'background-file'
    }

    await this.ninoxClient.updateDatabaseSettings(database.id, database.settings)
    await this.ninoxClient.uploadDatabaseSchemaToNinox(database.id, schema)
  }
}
