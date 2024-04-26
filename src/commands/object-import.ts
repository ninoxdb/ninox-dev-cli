import { Command } from "commander";
import { run } from "../handlers/ImportHandler";

const objectImport = new Command("object:import");

objectImport
  .description("Import an object from a live Ninox Database into your project")
  .requiredOption("-id, --id <id>", "Object ID of the Ninox Database object to import")
  .option("-t, --type <type>", "Object Type e.g Database, Table, View, Field")
  .option("-d, --domain <domain>", "Domain")
  .option("-w, --workspaceId <workspaceId>", "Workspace ID")
  .option("-k, --apiKey <API Key>", "API Key")
  .action(async (options) => {
    try {
      // console.log("object:import command called", options);
      await run(options, JSON.parse(process.env.ENVIRONMENT ?? ""));
      console.log("Success: object import command completed");
    } catch (e) {
      if (e instanceof Error) console.log("ERROR: Failed to import", e.message);
    }
  })
  .parse(process.argv);
