import { Command } from "commander";
import { run } from "../handlers/init-handler";
import { ERROR_MESSAGES } from "../common/constants";

const list = new Command("list");

list
  .description("List objects from a live Ninox Account")
  .option(
    "-t, --type <object type>",
    "(optional) Type of Ninox objects to list"
  )
  .action(async (options) => {
    try {
      // await run(options);
      console.log(ERROR_MESSAGES.NOT_IMPLEMENTED);
    } catch (e) {
      if (e instanceof Error)
        console.log(ERROR_MESSAGES.LIST_FAILED, e.message);
    }
  })
  .parse(process.argv);
