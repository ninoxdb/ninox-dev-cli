import {Args, Command} from '@oclif/core'

import {EnvironmentConfig, getEnvironment} from './utils/config.js'

export abstract class BaseCommand extends Command {
  static override args = {
    env: Args.string({default: 'DEV', description: 'environment to read', hidden: true, required: true}),
  }

  environment: EnvironmentConfig = {apiKey: '', domain: '', workspaceId: ''}

  async init(): Promise<void> {
    await super.init()
    this.environment = this.readEnvironmentConfig()
  }

  // This method will be overridden in commands to indicate if an environment is needed
  needsEnvironment(): boolean {
    return true
  }

  public readEnvironmentConfig(): EnvironmentConfig {
    const {argv} = this
    let environment: EnvironmentConfig = {apiKey: '', domain: '', workspaceId: ''}
    if (this.needsEnvironment()) {
      const envName = argv.at(-1) as string
      if (!envName) {
        this.error('No environment specified and no default environment set')
      }

      try {
        environment = getEnvironment(envName)
      } catch (error) {
        if (error instanceof Error) this.error(error.message)
      }

      if (environment.apiKey === '' && environment.domain === '' && environment.workspaceId === '') {
        this.error('Missing environment configuration. Please check your configuration file.')
      }

      // remove the last argument
      argv.pop()
    }

    return environment
  }
}
