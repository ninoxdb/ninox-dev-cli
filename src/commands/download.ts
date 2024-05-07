import {Flags} from '@oclif/core'

import {BaseCommand} from '../core/common/base.js'
import {Credentials, ImportCommandOptions} from '../core/common/typings.js'
import {EnvironmentConfig} from '../core/utils/config.js'
import {createDatabaseFolderInFiles} from '../core/utils/fs-util.js'
import {parseData, writeToFiles} from '../core/utils/import-util.js'
import {downloadDatabaseBackgroundImage, getDatabase} from '../core/utils/ninox-client.js'

export default class Download extends BaseCommand {
  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    // flag with a value (-n, --name=VALUE)
    id: Flags.string({char: 'i', description: 'Database ID to Download', required: true}),
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
    const {flags} = await this.parse(Download)
    await this.handle({id: flags.id}, this.environment as EnvironmentConfig)

    this.debug(`hello from /Users/muhammad/Code/Ninox/database-cli/src/commands/download.ts`)
  }
}
