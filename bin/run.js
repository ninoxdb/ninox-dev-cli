#!/usr/bin/env node

// Pre-process/prune flags before creating or running the actual CLI
// (await import('../dist/flags.js')).preprocessCliFlags(process);

const oclif = await import('@oclif/core')
const {createRequire} = await import('node:module')
const pjson = createRequire(import.meta.url)('../package.json')

const cli = await import('../dist/cli.js')

async function main() {
  cli
    .create({bin: pjson.oclif.bin, channel: 'stable', version: pjson.version})
    .run()
    .then(async () => {
      await oclif.flush()
    })
    .catch(async (error) => {
      await oclif.handle(error)
    })
}

await main()
