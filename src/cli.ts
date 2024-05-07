import {run} from '@oclif/core'

async function main() {
  const argv = process.argv.slice(2)

  if (argv.length < 2) {
    console.error('Usage: ./bin/dev.js <environment> <command>')
    throw new Error('Invalid arguments')
    // process.exit(1);
  }

  // Extract the environment argument and then pass the rest to oclif
  const [environment, command, ...restArgs] = argv
  await run([command, environment, ...restArgs])
}

try{
await main();
}
catch(error){
  console.error(error)
  throw error
}