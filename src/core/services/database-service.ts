import {inject, injectable} from 'tsyringe'

import {DatabaseMetadata, DatabaseSchemaType, DatabaseType} from '../common/schema-validators.js'
import {NinoxClient} from '../utils/ninox-client.js'
import {INinoxObjectService, IProjectService} from './interfaces.js'

@injectable()
export class DatabaseService implements INinoxObjectService<DatabaseMetadata> {
  protected databaseId?: string
  protected ninoxClient: NinoxClient
  protected ninoxProjectService: IProjectService
  protected workspaceId: string

  public constructor(
    @inject('NinoxProjectService') ninoxProjectService: IProjectService,
    @inject(NinoxClient) ninoxClient: NinoxClient,
    @inject('EnvironmentConfig') workspaceId: string,
  ) {
    this.ninoxProjectService = ninoxProjectService
    this.ninoxClient = ninoxClient
    this.workspaceId = workspaceId
  }

  public async download(id: string): Promise<void> {
    const databaseData = await this.ninoxClient.getDatabase(id)

    const {schema: schemaData, ...databaseRemainingData} = databaseData

    const {database, schema, tables} = this.ninoxProjectService.parseDatabaseConfigs(
      {id, ...databaseRemainingData},
      schemaData,
    )
    await this.ninoxProjectService.writeDatabaseToFiles(database, schema, tables)
    await this.ninoxProjectService.createDatabaseFolderInFiles(id)
    await this.ninoxClient.downloadDatabaseBackgroundImage(id, this.ninoxProjectService.getDbBackgroundImagePath(id))
    // download views
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
}
