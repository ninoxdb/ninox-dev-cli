import {Config, execute, run as oclifRun} from '@oclif/core'
import debug from 'debug'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const logger = debug('ninox:cli')

type CreateOptions = {
  bin: string | undefined
  channel: string
  development?: boolean
  run?: typeof oclifRun
  version: string
}

export function create({bin, channel, development, run, version}: CreateOptions): {run: () => Promise<unknown>} {
  const root = resolve(fileURLToPath(import.meta.url), '..')
  const args = process.argv.slice(2)

  return {
    async run(): Promise<unknown> {
      const config = new Config({
        channel,
        name: bin,
        root,
        version,
      })
      await config.load()
      logger(version, channel, config)

      // Extract the environment argument and then pass the rest to oclif
      const [environment, topic, command, ...restArgs] = args
      const _args =
        needsEnvironment(topic) || needsEnvironment(command) ? [topic, command, ...restArgs, environment] : args

      // Example of how run is used in a test https://github.com/salesforcecli/cli/pull/171/files#diff-1deee0a575599b2df117c280da319f7938aaf6fdb0c04bcdbde769dbf464be69R46
      if (development) return execute({args: _args, development, dir: import.meta.url})
      return run ? run(_args, config) : oclifRun(_args, config)
    },
  }
}

function needsEnvironment(command: string): boolean {
  return ['database', 'download', 'list', 'list3', 'upload'].includes(command)
}
