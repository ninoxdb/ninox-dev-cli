import {Flags} from '@oclif/core'
import 'reflect-metadata'
import {container} from 'tsyringe'

import {BaseCommand} from '../../core/base.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {INinoxObjectService} from '../../core/services/interfaces.js'

export default class DownloadCommand extends BaseCommand {
  public static override description =
    'Download the settings and configuration (i.e Tables, Fields, Views and Reports) of a Ninox database to the local filesystem. The ENV argument comes before the command name e.g ninox <ENV> database download -i 1234.'

  public static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %> -i 1234']
  public static override flags = {
    id: Flags.string({char: 'i', description: 'Database ID to Download', required: true}),
  }

  protected databaseService!: INinoxObjectService<unknown>

  protected async init(): Promise<void> {
    await super.init()
    this.databaseService = container.resolve(DatabaseService)
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(DownloadCommand)
    await this.databaseService.download(flags.id)
    this.debug(`success src/commands/download.ts`)
    this.log(`Downloaded database ${flags.id} successfully!`)
  }
}
