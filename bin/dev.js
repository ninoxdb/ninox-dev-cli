#!/usr/bin/env -S node --loader ts-node/esm --no-warnings=ExperimentalWarning
// eslint-disable-next-line n/shebang
const oclif = await import('@oclif/core')
const {createRequire} = await import('node:module')
const pjson = createRequire(import.meta.url)('../package.json')
// eslint-disable-next-line n/no-unpublished-import
const cli = await import('../src/cli.js')

async function main() {
  cli
    .create({bin: pjson.oclif.bin, channel: 'stable',development: true, version: pjson.version, })
    .run()
    .then(async () => {
      await oclif.flush()
    })
    .catch(async (error) => {
      await oclif.handle(error)
    })
}

await main()