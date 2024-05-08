import {Args, Command} from '@oclif/core'
import {env} from 'node:process'

import {EnvironmentConfig, getEnvironment} from '../utils/config.js'

export abstract class BaseCommand extends Command {
  static override args = {
    env: Args.string({description: 'environment to read', hidden: true, required: true}),
    // id: Args.string({description: 'Database ID to Download', required: true}),
  }

  environment?: EnvironmentConfig

  // async catch(err: Error): Promise<void> {
  //   // this.error(err.message)
  //   throw err;
  // }

  async init(): Promise<void> {
    await super.init()

    // Override this function in each command to selectively load the environment
    // const {argv} = await this.parse(BaseCommand)
    this.environment = this.readEnvironmentConfig()
  }

  // This method will be overridden in commands to indicate if an environment is needed
  needsEnvironment(): boolean {
    // return process.env.NODE_ENV!=='test'
    return true;
  }

  public readEnvironmentConfig(): EnvironmentConfig | undefined {
    const {argv} = this
    let environment
    if (this.needsEnvironment()) {
      // && argv.length > 0
      const envName = argv.at(-1) as string

      try {
        environment = getEnvironment(envName) // envName ?  : getDefaultEnvironment()
      } catch (error) {
        if (error instanceof Error) this.error(error.message)
      }

      if (!environment) {
        this.error('No environment specified and no default environment set')
      }

      // Remove the first argument (environment name) for subcommands
      // argv.shift(-1)
      argv.pop()
    }

    return environment
  }
}
