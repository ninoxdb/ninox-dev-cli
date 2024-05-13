import {Flags} from '@oclif/core'

import {BaseCommand} from '../core/base.js'
import {Credentials, ImportCommandOptions} from '../core/common/typings.js'
import {EnvironmentConfig} from '../core/utils/config.js'
import {FSUtil} from '../core/utils/fs-util.js'
import {parseData, writeToFiles} from '../core/utils/import-util.js'
import {NinoxClient} from '../core/utils/ninox-client.js'

export default class Download extends BaseCommand {
  static override description =
    'Download the settings and configuration (e.g Tables, Fields, Views and Reports) of a Ninox database to the local filesystem. The ENV argument comes before the command name.'

  static override examples = ['<%= config.bin %> <%= command.args.env.default %> <%= command.id %> -i 1234']

  static override flags = {
    id: Flags.string({char: 'i', description: 'Database ID to Download', required: true}),
  }

  private handle = async (opts: ImportCommandOptions, creds: Credentials): Promise<void> => {
    const dbData = await NinoxClient.getDatabase(opts.id, creds)

    const {schema: schemaData, ...dbRemainingData} = dbData

    const {database, schema, tables} = parseData({...dbRemainingData, id: opts.id}, schemaData)
    await writeToFiles(database, schema, tables)
    await FSUtil.createDatabaseFolderInFiles(opts.id)
    await NinoxClient.downloadDatabaseBackgroundImage(opts, creds)
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Download)
    await this.handle({id: flags.id}, this.environment as EnvironmentConfig)
    this.debug(`success src/commands/download.ts`)
    this.log(`Downloaded database ${flags.id} successfully!`)
  }
}
