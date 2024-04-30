import { Command } from "commander";
import { run } from "../handlers/import-handler";
import { AxiosError } from "axios";

const objectImport = new Command("object:import");

objectImport
  .description("Import an object from a live Ninox Database into your project")
  .requiredOption(
    "-id, --id <id>",
    "Object ID of the Ninox Database object to import"
  )
  .option("-t, --type <type>", "Object Type e.g Database, Table, View, Field")
  .action(async (options) => {
    try {
      await run(options, JSON.parse(process.env.ENVIRONMENT ?? ""));
      console.log("Success: object import command completed");
    } catch (e) {
      if (e instanceof AxiosError)
        console.log(
          `ERROR: Failed to deploy ${e.code} ${e.message}`,
          e.response?.data
        );
      else if (e instanceof Error)
        console.log("ERROR: Failed to import", e.message);
    }
  })
  .parse(process.argv);
