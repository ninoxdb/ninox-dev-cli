import {Args, Command, Flags} from '@oclif/core'

import {InitCommandOptions} from '../core/common/typings.js'
import {FSUtil} from '../core/utils/fs-util.js'

export default class Init extends Command {
  static override args = {
    name: Args.string({description: 'Name of the Ninox project', required: true}),
  }

  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Init)

    const name = flags.name ?? 'world'
    this.log(`hello ${name} from /Users/muhammad/Code/Ninox/database-cli/src/commands/init.ts`)
    await handle({name: args.name})
  }
}

export const handle = async (opts: InitCommandOptions) => {
  await FSUtil.createPackageJson(opts.name, opts.description)
  await FSUtil.createConfigYaml()
  await FSUtil.ensureRootDirectoryStructure()
}
