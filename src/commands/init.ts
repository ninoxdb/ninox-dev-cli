import {Args, Command} from '@oclif/core'

import {InitCommandOptions} from '../core/common/typings.js'
import {FSUtil} from '../core/utils/fs-util.js'

export default class Init extends Command {
  static override args = {
    name: Args.string({description: 'Name of the Ninox project', required: true}),
  }

  static override description = 'Initialize a new Ninox project in the current directory'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  private handle = async (opts: InitCommandOptions) => {
    await FSUtil.createPackageJson(opts.name)
    await FSUtil.createConfigYaml()
    await FSUtil.ensureRootDirectoryStructure()
  }

  public foo(): void {}

  public async run(): Promise<void> {
    const {args} = await this.parse(Init)

    await this.handle({name: args.name})
    this.debug(`success src/commands/init.ts`)
    this.log(`Initialized Ninox project ${args.name} successfully!`)
  }
}
