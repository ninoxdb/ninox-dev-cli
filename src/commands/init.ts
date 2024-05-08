import {Args, Command} from '@oclif/core'

import {InitCommandOptions} from '../core/common/typings.js'
import {FSUtil} from '../core/utils/fs-util.js'

export default class Init extends Command {
  static override args = {
    name: Args.string({description: 'Name of the Ninox project', required: true}),
  }

  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  private handle = async (opts: InitCommandOptions) => {
    await FSUtil.createPackageJson(opts.name, opts.description)
    await FSUtil.createConfigYaml()
    await FSUtil.ensureRootDirectoryStructure()
  }

  public foo(): void {}

  public async run(): Promise<void> {
    const {args} = await this.parse(Init)

    this.debug(`hello from /Users/muhammad/Code/Ninox/database-cli/src/commands/init.ts`)
    await this.handle({name: args.name})
    this.log(`Initialized Ninox project ${args.name} successfully!`);
  }
}
