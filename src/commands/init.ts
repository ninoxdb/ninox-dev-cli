import { Command } from "commander";
import { run } from "../handlers/InitHandler";

const init = new Command("init");

init
  .description("Initialize a new project")
  .option("-n, --name <name>", "Name of the project")
  .option(
    "-d, --description <description>",
    "(optional) Description of the project"
  )
  .option("-id, --id <id>", "(optional) ID of the Ninox Database")
  .action(async (options) => {
    try {
      await run(options);
      console.log(`Success: Project initialized with name: ${options.name}`);
    } catch (e) {
      if (e instanceof Error)
        console.log("Failed to initialize project", e.message);
    }
  })
  .parse(process.argv);
