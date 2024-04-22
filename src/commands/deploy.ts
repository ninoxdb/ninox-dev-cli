import { Command } from "commander";
import { run } from "../handlers/DeployHandler";

const deploy = new Command("deploy");

deploy
  .description("Import an object from Ninox")
  .option("-t, --type <type>", "Object Type e.g Database, Table, View, Field")
  .option("-id, --id <id>", "Object ID")
  .option("-d, --domain <domain>", "Domain")
  .option("-w, --workspaceId <workspaceId>", "Workspace ID")
  .option("-k, --apiKey <API Key>", "API Key")
  .option("-p, --protocol <protocol>", "Protocol HTTP or HTTPS")
  .action(async (options) => {
    try {
      console.log("Deploy command called", options);
      await run(options);
      console.log("Success: Deploy command completed");
    } catch (e) {
      if (e instanceof Error) console.log("Failed: to deploy", e.message);
    }
  })
  .parse(process.argv);