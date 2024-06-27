import ora from 'ora'
import table from 'tty-table'

import {BaseCommand} from '../../core/base.js'
import {DatabaseMetadata} from '../../core/common/schema-validators.js'
import {EnvironmentConfig} from '../../core/common/types.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {INinoxObjectService} from '../../core/services/interfaces.js'
import {NinoxProjectService} from '../../core/services/ninoxproject-service.js'
import {FSUtil} from '../../core/utils/fs.js'
import {NinoxClient} from '../../core/utils/ninox-client.js'
import {isTest} from '../../core/utils/util.js'
export default class ListCommand extends BaseCommand {
  public static override description =
    'List all the database names and ids in the Ninox cloud server. The ENV argument comes before the command name.'

  public static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %>']

  protected databaseService!: INinoxObjectService<DatabaseMetadata>

  protected async init(): Promise<void> {
    await super.init()
    if (!isTest())
      this.spinner = ora(`Listing all Databases in the workspace ${this.environment.workspaceId}\n`).start()
    const context = {debug: this.debug}
    this.databaseService = new DatabaseService(
      new NinoxProjectService(new FSUtil(), context),
      new NinoxClient(this.environment as EnvironmentConfig),
      context,
    )
  }

  public async run(): Promise<void> {
    await this.parse(ListCommand)
    const dbs = await this.databaseService.list()
    const ANSI = table(
      [
        {alias: '#', value: 'idx'},
        {alias: 'Database name', align: 'left', headerAlign: 'left', value: 'name', width: 20},
        {alias: 'Database ID', value: 'id'},
      ],
      dbs.map((database, index) => ({...database, idx: index + 1})),
      [],
      {
        borderColor: 'green',
        borderStyle: 'solid',
      },
    ).render()
    this.log(`${ANSI}\n`)

    this.spinner?.stop()
    this.debug(`success src/commands/list.ts`)
  }
}
