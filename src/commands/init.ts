import {Args, Command} from '@oclif/core'

import {NinoxProjectService} from '../core/services/ninoxproject-service.js'

export default class Init extends Command {
  static override args = {
    name: Args.string({description: 'Name of the Ninox project', required: true}),
  }

  static override description = 'Initialize a new Ninox project in the current directory'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  protected ninoxProjectService!: NinoxProjectService

  private handle = async () => {
    this.ninoxProjectService.initialiseProject()
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(Init)
    this.ninoxProjectService = new NinoxProjectService('', args.name)
    await this.handle()
    this.debug(`success src/commands/init.ts`)
    this.log(`Initialized Ninox project ${args.name} successfully!`)
  }
}
