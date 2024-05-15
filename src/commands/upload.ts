import {Flags} from '@oclif/core'

import {BaseCommand} from '../core/base.js'
import {DeployCommandOptions, EnvironmentConfig} from '../core/common/types.js'
import {DatabaseService} from '../core/services/database-service.js'
import {NinoxProjectService} from '../core/services/ninoxproject-service.js'
import {NinoxClient} from '../core/utils/ninox-client.js'

export default class UploadCommand extends BaseCommand {
  static override description =
    'Deploy the local database configuration to the Ninox cloud server. The ENV argument comes before the command name.'

  static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %> -i 1234']

  static override flags = {
    id: Flags.string({char: 'i', description: 'Database ID to Download', required: true}),
  }

  protected databaseService!: DatabaseService
  protected ninoxProjectService!: NinoxProjectService

  private async handle(opts: DeployCommandOptions): Promise<void> {
    const {database, schema} = await this.ninoxProjectService.readDatabaseConfig(opts.id)
    await this.databaseService.uploadDatabase(database, schema)
  }

  // eslint-disable-next-line perfectionist/sort-classes
  async init(): Promise<void> {
    await super.init()
    this.databaseService = new DatabaseService(
      new NinoxClient(this.environment as EnvironmentConfig),
      this.environment.workspaceId,
    )
    this.ninoxProjectService = new NinoxProjectService()
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(UploadCommand)
    await this.handle(flags)
    this.debug(`success src/commands/upload.ts`)
    this.log(`Uploaded database ${flags.id} successfully!`)
  }
}
