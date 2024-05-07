// export {run} from '@oclif/core'
import { Command, Flags, run } from '@oclif/core';

class CLI extends Command {
  static flags = {
    help: Flags.boolean({ char: 'h', description: 'show help' }),
    version: Flags.boolean({ char: 'v', description: 'show CLI version' }),
  };

  async run() {
    const { argv } = await this.parse(CLI);

    if (argv.length < 2) {
      this.error('Usage: ./bin/dev.js <environment> <command>');
    }

    const [, command, ...restArgs] = argv;
    await run([`${command}`, ...restArgs as string[]], this.config);
  }
}

export default CLI;
