import { Command } from "commander";
import { run } from "../common/doImportTest";

const objectImport = new Command("object:import");

objectImport
  .description("Import an object from Ninox")
  .option("-t, --type <type>", "Object Type e.g Database, Table, View, Field")
  .option("-id, --id <id>", "Object ID")
  .option("-d, --domain <domain>", "Domain")
  .option("-w, --workspaceId <workspaceId>", "Workspace ID")
  .option("-k, --apiKey <API Key>", "API Key")
  .action(async (options) => {
    console.log("object:import command called", options);
    await run(options);
  })
  .parse(process.argv);

export interface Options {
  type: string;
  id: string;
  domain: string;
  workspaceId: string;
  apiKey: string;
}
