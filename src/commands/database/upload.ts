import {Flags} from '@oclif/core'

import {BaseCommand} from '../../core/base.js'
import {EnvironmentConfig} from '../../core/common/types.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {INinoxObjectService} from '../../core/services/interfaces.js'
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

  protected databaseService!: INinoxObjectService<unknown>

  protected async init(): Promise<void> {
    await super.init()
    const {flags} = await this.parse(UploadCommand)
    const fsUtil = new FSUtil()
    this.databaseService = new DatabaseService(
      new NinoxProjectService(fsUtil, flags.id, this.debug),
      new NinoxClient(this.environment as EnvironmentConfig),
      flags.id,
      this.debug,
    )
  }

  public async run(): Promise<void> {
    await this.databaseService.upload()
    this.debug(`success src/commands/upload.ts`)
    this.log(`Uploaded database ${this.databaseService.getDBId()} successfully!`)
  }
}
