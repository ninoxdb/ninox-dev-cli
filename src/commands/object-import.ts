import { Command } from "commander";
import { run } from "../handlers/ImportHandler";

const objectImport = new Command("object:import");

objectImport
  .description("Import an object from Ninox")
  .option("-t, --type <type>", "Object Type e.g Database, Table, View, Field")
  .option("-id, --id <id>", "Object ID")
  .option("-d, --domain <domain>", "Domain")
  .option("-w, --workspaceId <workspaceId>", "Workspace ID")
  .option("-k, --apiKey <API Key>", "API Key")
  .option("-p, --protocol <Protocol>", "Protocol HTTP or HTTPS")
  .action(async (options) => {
    try {
      console.log("object:import command called", options);
      await run(options);
      console.log("Success: object import command completed");
    } catch (e) {
      if (e instanceof Error) console.log("Failed: to import", e.message);
    }
  })
  .parse(process.argv);