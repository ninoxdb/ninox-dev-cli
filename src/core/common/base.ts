import {Args, Command} from '@oclif/core'

import {EnvironmentConfig, getEnvironment} from '../utils/config.js'




export abstract class BaseCommand extends Command {
  static override args = {
    env: Args.string({description: 'environment to read', required: true}),
  }

  environment?: EnvironmentConfig

  async catch(err: Error): Promise<void> {
    this.error(err.message)
  }

  async init(): Promise<void> {
    await super.init()

    // Override this function in each command to selectively load the environment
    // const {argv} = await this.parse(BaseCommand);
    const {argv} = this;
    // if (!isHelpArg(args)) {
    //   debug('loading config file')
    //   try {
    //     const _env = getEnvironment(environment)
    //     _args = [command, ...restArgs]

    //     const ninoxEnv: NinoxEnvironment = {
    //       NX_API_KEY: _env.apiKey,
    //       NX_DOMAIN: _env.domain,
    //       NX_WORKSPACE_ID: _env.workspaceId,
    //     }
    //     // const env = new Env(ninoxEnv);
    //     // process.env.set('saqib', 'ali');
    //     for (const [key, value] of Object.entries(ninoxEnv)) {
    //       process.env[key] = value
    //     }
    //   } catch {}
    // }
    if (this.needsEnvironment() && argv.length > 0) {
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
      // argv.shift()
    }
  }

  // This method will be overridden in commands to indicate if an environment is needed
  needsEnvironment(): boolean {
    return true
  }
}
