import {Args, Flags} from '@oclif/core'

import {BaseCommand} from '../core/common/base.js'
import {Credentials, ImportCommandOptions, NinoxCredentials} from '../core/common/typings.js'
import {EnvironmentConfig} from '../core/utils/config.js'
import {createDatabaseFolderInFiles} from '../core/utils/fs-util.js'
import {parseData, writeToFiles} from '../core/utils/import-util.js'
import {downloadDatabaseBackgroundImage, getDatabase} from '../core/utils/ninox-client.js'

export default class Download extends BaseCommand {
  static override args = {
    env: Args.string({description: 'file to read', required: true}),
    id: Args.string({description: 'Database ID to Download', required: true}),
  }

  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  private handle = async (opts: ImportCommandOptions, creds: Credentials): Promise<void> => {
    // make a request to the Ninox API to get the database
    const dbData = await getDatabase(opts.id, creds)

    const {schema: schemaData, ...dbRemainingData} = dbData

    const {database, schema, tables} = parseData({...dbRemainingData, id: opts.id}, schemaData)
    await writeToFiles(database, schema, tables)
    await createDatabaseFolderInFiles(opts.id)
    // download the background image from /{accountId}/root/background.jpg
    await downloadDatabaseBackgroundImage(opts, creds)
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(Download)
    this.log(args.toString())
    await this.handle({id: args.id}, this.environment as EnvironmentConfig)

    this.log(`hello from /Users/muhammad/Code/Ninox/database-cli/src/commands/download.ts`)
  }
}
