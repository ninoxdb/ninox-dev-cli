import {Flags} from '@oclif/core'
import 'reflect-metadata'
import {container} from 'tsyringe'

import {BaseCommand} from '../../core/base.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {INinoxObjectService} from '../../core/services/interfaces.js'

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
    this.databaseService = container.resolve(DatabaseService)
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(UploadCommand)
    await this.databaseService.upload(flags.id)
    this.debug(`success src/commands/upload.ts`)
    this.log(`Uploaded database ${flags.id} successfully!`)
  }
}
