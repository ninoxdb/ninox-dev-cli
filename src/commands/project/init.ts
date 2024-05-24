import {Args, Command} from '@oclif/core'
import 'reflect-metadata'
import {container} from 'tsyringe'

import {IProjectService} from '../../core/services/interfaces.js'
import {NinoxProjectService} from '../../core/services/ninoxproject-service.js'
import {FSUtil} from '../../core/utils/fs.js'

export default class InitCommand extends Command {
  public static override args = {
    name: Args.string({description: 'Name of the Ninox project', required: true}),
  }

  public static override description = 'Initialize a new Ninox project in the current directory'

  public static override examples = ['<%= config.bin %> <%= command.id %>']

  protected ninoxProjectService!: IProjectService

  protected async init(): Promise<void> {
    await super.init()
    container.registerSingleton(FSUtil)
    container.register<IProjectService>('NinoxProjectService', {
      useClass: NinoxProjectService,
    })
    this.ninoxProjectService = container.resolve(NinoxProjectService)
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(InitCommand)
    await this.ninoxProjectService.initialiseProject(args.name)
    this.debug(`success src/commands/init.ts`)
    this.log(`Initialized Ninox project ${args.name} successfully!`)
  }
}
