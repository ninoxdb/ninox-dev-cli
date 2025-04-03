import {Flags} from '@oclif/core'
import ora from 'ora'

import {BaseCommand} from '../../core/base.js'
import {EnvironmentConfig} from '../../core/common/types.js'
import {DatabaseService} from '../../core/services/database-service.js'
import {INinoxObjectService} from '../../core/services/interfaces.js'
import {NinoxProjectService} from '../../core/services/ninoxproject-service.js'
import {FSUtil} from '../../core/utils/fs.js'
import {NinoxClient} from '../../core/utils/ninox-client.js'
import {isTest} from '../../core/utils/util.js'

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
    const {flags} = await this.parse(DownloadCommand)
    if (!isTest()) this.spinner = ora(`Downloading Database ${flags.id}\n`).start()
    const fsUtil = new FSUtil()
    const context = {debug: this.debug}
    this.databaseService = new DatabaseService(
      new NinoxProjectService(fsUtil, context, flags.id, this.spinner),
      new NinoxClient(this.environment as EnvironmentConfig),
      context,
      flags.id,
    )
  }

  public async run(): Promise<void> {
    await this.databaseService.download()
    this.spinner?.stop()
    this.debug(`success src/commands/download.ts`)
    this.log(
      `Downloaded database ${this.databaseService.getDBName()} (${this.databaseService.getDBId()}) successfully!`,
    )
  }
}
