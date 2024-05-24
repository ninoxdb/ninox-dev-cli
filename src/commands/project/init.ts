import {Args, Command} from '@oclif/core'

import {NinoxProjectService} from '../../core/services/ninoxproject-service.js'
import {FSUtil} from '../../core/utils/fs.js'

export default class InitCommand extends Command {
  public static override args = {
    name: Args.string({description: 'Name of the Ninox project', required: true}),
  }

  public static override description = 'Initialize a new Ninox project in the current directory'

  public static override examples = ['<%= config.bin %> <%= command.id %>']

  protected ninoxProjectService!: NinoxProjectService

  protected async init(): Promise<void> {
    await super.init()
    const fsUtil = new FSUtil()
    this.ninoxProjectService = new NinoxProjectService(fsUtil)
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(InitCommand)
    await this.ninoxProjectService.initialiseProject(args.name)
    this.debug(`success src/commands/init.ts`)
    this.log(`Initialized Ninox project ${args.name} successfully!`)
  }
}
