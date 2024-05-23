import {Args, Command} from '@oclif/core'
import {container, injectable} from 'tsyringe'

import {InitCommandOptions} from '../../core/common/types.js'
import {InitProjectService} from '../../core/services/init-project.service.js'

@injectable()
export default class InitCommand extends Command {
  public static override args = {
    name: Args.string({description: 'Name of the Ninox project', required: true}),
  }

  public static override description = 'Initialize a new Ninox project in the current directory'

  public static override examples = ['<%= config.bin %> <%= command.id %>']

  private initProjectService!: InitProjectService

  protected async init(): Promise<void> {
    container.register('BasePath', {useValue: process.cwd()})
    await super.init()
    this.initProjectService = container.resolve(InitProjectService)
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(InitCommand)
    await this.handle(args)
    this.debug(`success src/commands/init.ts`)
    this.log(`Initialized Ninox project ${args.name} successfully!`)
  }

  private async handle(options: InitCommandOptions): Promise<void> {
    return this.initProjectService.initialiseProject(options.name)
  }
}
