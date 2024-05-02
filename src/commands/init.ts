import { Command } from "commander";
import { run } from "../handlers/init-handler";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../common/constants";

const init = new Command("init");

init
  .description("Initialize a new project")
  .requiredOption("-n, --name <name>", "Name of the project")
  .option(
    "-d, --description <description>",
    "(optional) Description of the project"
  )
  .option("-id, --id <id>", "(optional) ID of the Ninox Database")
  .action(async (options) => {
    try {
      await run(options);
      console.log(`${SUCCESS_MESSAGES.INIT_SUCCESS}: ${options.name}`);
    } catch (e) {
      if (e instanceof Error)
        console.log(ERROR_MESSAGES.INIT_FAILED, e.message);
    }
  })
  .parse(process.argv);
