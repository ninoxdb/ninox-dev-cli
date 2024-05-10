import {Args, Command} from '@oclif/core'

import {EnvironmentConfig, getEnvironment} from '../utils/config.js'

export abstract class BaseCommand extends Command {
  static override args = {
    env: Args.string({description: 'environment to read', hidden: true, required: true}),
  }

  environment?: EnvironmentConfig

  async init(): Promise<void> {
    await super.init()
    this.environment = this.readEnvironmentConfig()
  }

  // This method will be overridden in commands to indicate if an environment is needed
  needsEnvironment(): boolean {
    return true
  }

  public readEnvironmentConfig(): EnvironmentConfig | undefined {
    const {argv} = this
    let environment
    if (this.needsEnvironment()) {
      const envName = argv.at(-1) as string

      try {
        environment = getEnvironment(envName)
      } catch (error) {
        if (error instanceof Error) this.error(error.message)
      }

      if (!environment) {
        this.error('No environment specified and no default environment set')
      }

      // remove the last argument
      argv.pop()
    }

    return environment
  }
}
