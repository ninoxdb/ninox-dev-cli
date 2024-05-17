import {BaseCommand} from '../../core/base.js'
import {EnvironmentConfig} from '../../core/common/types.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {NinoxClient} from '../../core/utils/ninox-client.js'

export default class ListCommand extends BaseCommand {
  public static override description =
    'List all the database names and ids in the Ninox cloud server. The ENV argument comes before the command name.'

  public static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %>']

  protected databaseService!: DatabaseService

  private async handle(): Promise<void> {
    const dbs = await this.databaseService.listDatabases()
    for (const database of dbs) {
      this.log(database.name, database.id)
    }
  }

  // eslint-disable-next-line perfectionist/sort-classes
  protected async init(): Promise<void> {
    await super.init()
    this.databaseService = new DatabaseService(
      new NinoxClient(this.environment as EnvironmentConfig),
      this.environment.workspaceId,
    )
  }

  public async run(): Promise<void> {
    await this.parse(ListCommand)
    await this.handle()
    this.debug(`success src/commands/list.ts`)
  }
}
