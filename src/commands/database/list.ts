import 'reflect-metadata'
import {container} from 'tsyringe'

import {BaseCommand} from '../../core/base.js'
import {DatabaseMetadata} from '../../core/common/schema-validators.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {INinoxObjectService} from '../../core/services/interfaces.js'

export default class ListCommand extends BaseCommand {
  public static override description =
    'List all the database names and ids in the Ninox cloud server. The ENV argument comes before the command name.'

  public static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %>']

  protected databaseService!: INinoxObjectService<DatabaseMetadata>

  protected async init(): Promise<void> {
    await super.init()
    this.databaseService = container.resolve(DatabaseService)
  }

  public async run(): Promise<void> {
    await this.parse(ListCommand)
    const dbs = await this.databaseService.list()
    for (const database of dbs) {
      this.log(database.name, database.id)
    }

    this.debug(`success src/commands/list.ts`)
  }
}
