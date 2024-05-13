import {BaseCommand} from '../../core/base.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {EnvironmentConfig} from '../../core/utils/config.js'
import {NinoxClient} from '../../core/utils/ninox-client.js'

export default class List extends BaseCommand {
  static override description =
    'List all the database names and ids in the Ninox cloud server. The ENV argument comes before the command name.'

  static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %>']

  protected databaseService!: DatabaseService

  private handle = async (): Promise<void> => {
    const dbs = await this.databaseService.listDatabases()
    for (const db of dbs) {
      this.log(db.name, db.id)
    }
  }

  async init(): Promise<void> {
    await super.init()
    this.databaseService = new DatabaseService(
      new NinoxClient(this.environment as EnvironmentConfig),
      this.environment.workspaceId,
    )
  }

  public async run(): Promise<void> {
    await this.parse(List)
    await this.handle()
    this.debug(`success src/commands/list.ts`)
  }
}
