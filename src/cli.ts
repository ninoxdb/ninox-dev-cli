import {Config, execute, run as oclifRun} from '@oclif/core'
// import {env} from './core/config.js'
import {Env} from '@salesforce/kit'
import Debug from 'debug'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

import {getEnvironment} from './core/utils/config.js'

// eslint-disable-next-line new-cap
const debug = Debug('ninox:cli')

type CreateOptions = {
  bin: string | undefined
  channel: string
  development?: boolean
  run?: typeof oclifRun
  version: string
}

type NinoxEnvironment = {
  NX_API_KEY: string
  NX_DOMAIN: string
  NX_WORKSPACE_ID: string
}

export function create({bin, channel, development, run, version}: CreateOptions): {run: () => Promise<unknown>} {
  const root = resolve(fileURLToPath(import.meta.url), '..')
  const args = process.argv.slice(2)

  //   if (!isHelpArg(args) && args.length < 2) {
  //     console.error('Usage: ./bin/dev.js <environment> <command>')
  //     throw new Error(`Invalid arguments: ${args}`)
  //   }

  // Extract the environment argument and then pass the rest to oclif

  // try loading the configuration file

  // here I can load the configuration file config.yml and load it into env variables
  //   console.log(env);

  return {
    async run(): Promise<unknown> {
      // const [environment, command, ...restArgs] = args
      // // console.log(environment, command, restArgs);
      // let _args = args
      // try loading the config file
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

      const config = new Config({
        channel,
        name: bin,
        root,
        version,
      })
      await config.load()
      debug(version, channel, config)

      // Extract the environment argument and then pass the rest to oclif
      const [environment, command, ...restArgs] = args
      const _args =
        needsEnvironment(environment) || needsEnvironment(command) ? [command, environment, ...restArgs] : args

      // Example of how run is used in a test https://github.com/salesforcecli/cli/pull/171/files#diff-1deee0a575599b2df117c280da319f7938aaf6fdb0c04bcdbde769dbf464be69R46
      if (development) return execute({args: _args, development, dir: import.meta.url})
      return run ? run(_args, config) : oclifRun(_args, config)
    },
  }
}

function isHelpArg(args: string[]): boolean {
  return args.includes('--help') || args.includes('-h') || args.includes('help')
}

function needsEnvironment(command: string): boolean {
  return ['download', 'list', 'list3','upload'].includes(command)
}
// async function main() {
//   const argv = process.argv.slice(2)

//   if (argv.length < 2) {
//     console.error('Usage: ./bin/dev.js <environment> <command>')
//     throw new Error('Invalid arguments')
//   }

//   // Extract the environment argument and then pass the rest to oclif
//   const [environment, command, ...restArgs] = argv
//   await run([command, environment, ...restArgs])
// }

// try {
//   await main()
// } catch (error) {
//   console.error(error)
//   throw error
// }
