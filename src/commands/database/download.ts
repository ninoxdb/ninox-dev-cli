import {Flags} from '@oclif/core'

import {BaseCommand} from '../../core/base.js'
import {EnvironmentConfig, ImportCommandOptions} from '../../core/common/types.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {NinoxProjectService} from '../../core/services/ninoxproject-service.js'
import {FSUtil} from '../../core/utils/fs.js'
import {NinoxClient} from '../../core/utils/ninox-client.js'

export default class DownloadCommand extends BaseCommand {
  public static override description =
    'Download the settings and configuration (i.e Tables, Fields, Views and Reports) of a Ninox database to the local filesystem. The ENV argument comes before the command name e.g ninox <ENV> database download -i 1234.'

  public static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %> -i 1234']
  public static override flags = {
    id: Flags.string({char: 'i', description: 'Database ID to Download', required: true}),
  }

  protected databaseService!: DatabaseService
  protected ninoxProjectService!: NinoxProjectService

  private async handle(options: ImportCommandOptions): Promise<void> {
    const databaseData = await this.databaseService.getDatabase(options.id)

    const {schema: schemaData, ...databaseRemainingData} = databaseData

    const {database, schema, tables} = this.ninoxProjectService.parseData(
      {...databaseRemainingData, id: options.id},
      schemaData,
    )
    await this.ninoxProjectService.writeToFiles(database, schema, tables)
    await this.ninoxProjectService.createDatabaseFolderInFiles(options.id)
    await this.databaseService.downloadDatabaseBackgroundImage(
      options.id,
      this.ninoxProjectService.getDbBackgroundImagePath(options.id),
    )
  }

  // eslint-disable-next-line perfectionist/sort-classes
  protected async init(): Promise<void> {
    await super.init()
    this.databaseService = new DatabaseService(
      new NinoxClient(this.environment as EnvironmentConfig),
      this.environment.workspaceId,
    )
    const fsUtil = new FSUtil()
    this.ninoxProjectService = new NinoxProjectService(fsUtil)
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(DownloadCommand)
    await this.handle({id: flags.id})
    this.debug(`success src/commands/download.ts`)
    this.log(`Downloaded database ${flags.id} successfully!`)
  }
}
