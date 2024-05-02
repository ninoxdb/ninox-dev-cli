import { Command } from "commander";
import { run } from "../handlers/import-handler";
import { AxiosError } from "axios";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../common/constants";

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
      console.log(SUCCESS_MESSAGES.IMPORT_SUCCESS);
    } catch (e) {
      if (e instanceof AxiosError)
        console.log(
          `${ERROR_MESSAGES.IMPORT_FAILED} ${e.code} ${e.message}`,
          e.response?.data
        );
      else if (e instanceof Error)
        console.log(ERROR_MESSAGES.IMPORT_FAILED, e.message);
    }
  })
  .parse(process.argv);
