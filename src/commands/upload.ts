import {Args} from '@oclif/core'

import {BaseCommand} from '../core/common/base.js'
import {Credentials, DeployCommandOptions} from '../core/common/typings.js'
import {EnvironmentConfig} from '../core/utils/config.js'
import {
  parseDatabaseAndSchemaFromFileContent,
  parseDatabaseConfigFileContentFromYaml,
} from '../core/utils/deploy-util.js'
import {readDefinedDatabaseConfigsFromFiles} from '../core/utils/fs-util.js'
import {uploadDatabase} from '../core/utils/ninox-client.js'

export default class Upload extends BaseCommand {
  static override args = {
    env: Args.string({description: 'file to read', required: true}),
    id: Args.string({description: 'Database ID to Download', required: true}),
  }

  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  private handle = async (opts: DeployCommandOptions, creds: Credentials): Promise<void> => {
    const dbConfigsInYaml = await readDefinedDatabaseConfigsFromFiles()

    const dbConfigs = dbConfigsInYaml
      .map((element) => parseDatabaseConfigFileContentFromYaml(element))
      .filter((dbConfig) => dbConfig.database.database?.id === opts.id)
      .map((element) => parseDatabaseAndSchemaFromFileContent(element))

    const results = []
    for (const {database, schema} of dbConfigs) {
      results.push(uploadDatabase(database, schema, creds))
    }

    Promise.all(results)
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(Upload)
    this.log(JSON.stringify(args))
    await this.handle(args, this.environment as EnvironmentConfig)
    this.log(`hello from /Users/muhammad/Code/Ninox/database-cli/src/commands/upload.ts`)
  }
}

// async function handle(opts: DeployCommandOptions, creds: Credentials) : Promise<void> {
//   const dbConfigsInYaml = await readDefinedDatabaseConfigsFromFiles()

//   const dbConfigs = dbConfigsInYaml
//     .map((element) => parseDatabaseConfigFileContentFromYaml(element))
//     .filter((dbConfig) => dbConfig.database.database?.id === opts.id)
//     .map((element) => parseDatabaseAndSchemaFromFileContent(element))

//   const results = [];
//   for (const {database, schema} of dbConfigs) {
//     results.push(uploadDatabase(database, schema, creds));
//   }

//   Promise.all(results);
// }
