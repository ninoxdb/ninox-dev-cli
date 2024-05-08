import {Flags} from '@oclif/core'

import {BaseCommand} from '../core/common/base.js'
import {Credentials, DeployCommandOptions} from '../core/common/typings.js'
import {EnvironmentConfig} from '../core/utils/config.js'
import {
  parseDatabaseAndSchemaFromFileContent,
  parseDatabaseConfigFileContentFromYaml,
} from '../core/utils/deploy-util.js'
import {FSUtil} from '../core/utils/fs-util.js'
import {NinoxClient} from '../core/utils/ninox-client.js'

export default class Upload extends BaseCommand {
  static override description = 'describe the command here'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    // flag with a value (-n, --name=VALUE)
    id: Flags.string({char: 'i', description: 'Database ID to Download', required: true}),
  }

  private handle = async (opts: DeployCommandOptions, creds: Credentials): Promise<void> => {
    const dbConfigsInYaml = await FSUtil.readDefinedDatabaseConfigsFromFiles()

    const dbConfigs = dbConfigsInYaml
      .map((element) => parseDatabaseConfigFileContentFromYaml(element))
      .filter((dbConfig) => dbConfig.database.database?.id === opts.id)
      .map((element) => parseDatabaseAndSchemaFromFileContent(element))

    const results = []
    for (const {database, schema} of dbConfigs) {
      results.push(NinoxClient.uploadDatabase(database, schema, creds))
    }

    await Promise.all(results)
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Upload)
    await this.handle(flags, this.environment as EnvironmentConfig)
    this.debug(`hello from /Users/muhammad/Code/Ninox/database-cli/src/commands/upload.ts`)
    this.log(`Uploaded database ${flags.id} successfully!`)
  }
}
