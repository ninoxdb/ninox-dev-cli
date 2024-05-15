import {Args, Command} from '@oclif/core'

import {InitCommandOptions} from '../core/common/types.js'
import {NinoxProjectService} from '../core/services/ninoxproject-service.js'

export default class InitCommand extends Command {
  static override args = {
    name: Args.string({description: 'Name of the Ninox project', required: true}),
  }

  static override description = 'Initialize a new Ninox project in the current directory'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  protected ninoxProjectService!: NinoxProjectService

  private async handle(opts: InitCommandOptions) {
    this.ninoxProjectService.initialiseProject(opts.name)
  }

  // eslint-disable-next-line perfectionist/sort-classes
  async init(): Promise<void> {
    await super.init()
    this.ninoxProjectService = new NinoxProjectService()
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(InitCommand)
    await this.handle(args)
    this.debug(`success src/commands/init.ts`)
    this.log(`Initialized Ninox project ${args.name} successfully!`)
  }
}
