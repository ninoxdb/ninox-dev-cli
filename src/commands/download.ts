import {Flags} from '@oclif/core'

import {BaseCommand} from '../core/base.js'
import {ImportCommandOptions} from '../core/common/typings.js'
import {DatabaseService} from '../core/services/database-service.js'
import {NinoxProjectService} from '../core/services/ninoxproject-service.js'
import {EnvironmentConfig} from '../core/utils/config.js'
import {NinoxClient} from '../core/utils/ninox-client.js'

export default class Download extends BaseCommand {
  static override description =
    'Download the settings and configuration (e.g Tables, Fields, Views and Reports) of a Ninox database to the local filesystem. The ENV argument comes before the command name.'

  static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %> -i 1234']
  static override flags = {
    id: Flags.string({char: 'i', description: 'Database ID to Download', required: true}),
  }

  protected databaseService!: DatabaseService
  protected ninoxProjectService!: NinoxProjectService

  private handle = async (opts: ImportCommandOptions): Promise<void> => {
    const dbData = await this.databaseService.getDatabase(opts.id)

    const {schema: schemaData, ...dbRemainingData} = dbData

    const {database, schema, tables} = this.ninoxProjectService.parseData({...dbRemainingData, id: opts.id}, schemaData)
    await this.ninoxProjectService.writeToFiles(database, schema, tables)
    await this.ninoxProjectService.createDatabaseFolderInFiles()
    await this.databaseService.downloadDatabaseBackgroundImage()
  }

  async init(): Promise<void> {
    await super.init()
    this.databaseService = new DatabaseService(
      new NinoxClient(this.environment as EnvironmentConfig),
      this.environment.workspaceId,
    )
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Download)
    this.ninoxProjectService = new NinoxProjectService(flags.id)
    await this.handle({id: flags.id})
    this.debug(`success src/commands/download.ts`)
    this.log(`Downloaded database ${flags.id} successfully!`)
  }
}
