import {Args, Command, Flags} from '@oclif/core'

import { BaseCommand } from './base.js'

export default class Download extends BaseCommand {
  static override args = {
    env: Args.string({description: 'file to read'}),
  }

  static override description = 'describe the command here'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Download)

    const name = flags.name ?? 'world'
    this.log(`hello ${name} from /Users/muhammad/Code/Ninox/database-cli/src/commands/download.ts`)
    if (args.env && flags.force) {
      this.log(`you input --force and --file: ${args.env}`)
    }
  }
}
