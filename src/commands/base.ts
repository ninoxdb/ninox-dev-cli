import {Args, Command} from '@oclif/core'

import {EnvironmentConfig, getEnvironment} from '../core/utils/config.js'

export abstract class BaseCommand extends Command {
  static override args = {
    env: Args.string({description: 'environment to read'}),
  }

  environment?: EnvironmentConfig

  async catch(err: Error): Promise<void> {
    this.error(err.message)
  }

  async init(): Promise<void> {
    await super.init()

    // Override this function in each command to selectively load the environment
    const {argv} = await this.parse(BaseCommand)

    if (this.needsEnvironment() && process.env.NX_WORKSPACE_ID && argv.length > 0) {
      const envName = argv[0] as string

      try {
        this.environment = getEnvironment(envName) // envName ?  : getDefaultEnvironment()
      } catch (error) {
        if (error instanceof Error) this.error(error.message)
      }

      if (!this.environment) {
        this.error('No environment specified and no default environment set')
      }

      // Remove the first argument (environment name) for subcommands
      argv.shift()
    }
  }

  // This method will be overridden in commands to indicate if an environment is needed
  needsEnvironment(): boolean {
    return true
  }
}
