import { Command } from "commander";
import { run } from "../handlers/InitHandler";

const list = new Command("list");

list
  .description("List objects from a live Ninox Account")
  .option("-t, --type <object type>", "(optional) Type of Ninox objects to list")
  .action(async (options) => {
    try {
      // await run(options);
      console.log('Not implemented');
    } catch (e) {
      if (e instanceof Error)
        console.log("ERROR: Failed to list objects", e.message);
    }
  })
  .parse(process.argv);
