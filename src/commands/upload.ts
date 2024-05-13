import {Flags} from '@oclif/core'

import {BaseCommand} from '../core/base.js'
import {DatabaseService} from '../core/services/database-service.js'
import {NinoxProjectService} from '../core/services/ninoxproject-service.js'
import {EnvironmentConfig} from '../core/utils/config.js'
import {NinoxClient} from '../core/utils/ninox-client.js'

export default class Upload extends BaseCommand {
  static override description =
    'Deploy the local database configuration to the Ninox cloud server. The ENV argument comes before the command name.'

  static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %> -i 1234']

  static override flags = {
    id: Flags.string({char: 'i', description: 'Database ID to Download', required: true}),
  }

  protected databaseService!: DatabaseService
  protected ninoxProjectService!: NinoxProjectService

  private handle = async (): Promise<void> => {
    const {database, schema} = await this.ninoxProjectService.readDatabaseConfig()
    await this.databaseService.uploadDatabase(database, schema)
  }

  async init(): Promise<void> {
    await super.init()
    this.databaseService = new DatabaseService(
      new NinoxClient(this.environment as EnvironmentConfig),
      this.environment.workspaceId,
    )
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Upload)
    this.ninoxProjectService = new NinoxProjectService(flags.id)
    await this.handle()
    this.debug(`success src/commands/upload.ts`)
    this.log(`Uploaded database ${flags.id} successfully!`)
  }
}
