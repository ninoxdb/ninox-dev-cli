import {Flags} from '@oclif/core'

import {BaseCommand} from '../../core/base.js'
import {DeployCommandOptions, EnvironmentConfig} from '../../core/common/types.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {NinoxProjectService} from '../../core/services/ninoxproject-service.js'
import {FSUtil} from '../../core/utils/fs.js'
import {NinoxClient} from '../../core/utils/ninox-client.js'

export default class UploadCommand extends BaseCommand {
  public static override description =
    'Deploy the local database configuration to the Ninox cloud server. The ENV argument comes before the command name.'

  public static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %> -i 1234']

  public static override flags = {
    id: Flags.string({char: 'i', description: 'Database ID to Download', required: true}),
  }

  protected databaseService!: DatabaseService
  protected ninoxProjectService!: NinoxProjectService

  private async handle(options: DeployCommandOptions): Promise<void> {
    const {database, schema} = await this.ninoxProjectService.readDatabaseConfig(options.id)
    const bgImagePath = this.ninoxProjectService.getDbBackgroundImagePath(options.id)
    await this.databaseService.uploadDatabase(
      database,
      schema,
      bgImagePath,
      this.ninoxProjectService.isDbBackgroundImageExists(options.id, bgImagePath),
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
    const {flags} = await this.parse(UploadCommand)
    await this.handle(flags)
    this.debug(`success src/commands/upload.ts`)
    this.log(`Uploaded database ${flags.id} successfully!`)
  }
}
