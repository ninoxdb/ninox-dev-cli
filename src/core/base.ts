import {Args, Command} from '@oclif/core'
import {Ora} from 'ora'

import {EnvironmentConfig} from './common/types.js'
import {getEnvironment} from './utils/config.js'

export abstract class BaseCommand extends Command {
  public static override args = {
    env: Args.string({default: 'DEV', description: 'environment to read', hidden: true, required: true}),
  }

  protected environment: EnvironmentConfig = {apiKey: '', domain: '', workspaceId: ''}

  protected spinner!: Ora

  protected async init(): Promise<void> {
    await super.init()
    if (this.needsEnvironment()) this.environment = this.readEnvironmentConfig()
  }

  // This method will be overridden in commands to indicate if an environment is needed
  protected needsEnvironment(): boolean {
    return true
  }

  public readEnvironmentConfig(): EnvironmentConfig {
    const {argv} = this
    let environment: EnvironmentConfig = {apiKey: '', domain: '', workspaceId: ''}
    const environmentName = argv.at(-1) as string
    if (!environmentName) {
      this.error('No environment specified and no default environment set')
    }

    try {
      environment = getEnvironment(environmentName)
    } catch (error) {
      if (error instanceof Error) this.error(error.message)
    }

    if (!environment.apiKey || !environment.domain || !environment.workspaceId) {
      this.error('Missing environment configuration. Please check your configuration file.')
    }

    // remove the last argument
    argv.pop()

    return environment
  }
}
