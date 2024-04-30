import { Command } from "commander";
import { run } from '@handlers/deploy-handler';
import { AxiosError } from "axios";

const deploy = new Command("deploy");

deploy
  .description(
    "Deploy Database configurations from your project to a live Ninox account"
  )
  .requiredOption("-id, --id <id>", "Object ID")
  .option("-t, --type <type>", "Object Type e.g Database, Table, View, Field")
  .option("-d, --domain <domain>", "Domain")
  .option("-w, --workspaceId <workspaceId>", "Workspace ID")
  .option("-k, --apiKey <API Key>", "API Key")
  .action(async (options) => {
    try {
      // console.log("Deploy command called", options);
      await run(options, JSON.parse(process.env.ENVIRONMENT ?? ""));
      console.log("Success: Deploy command completed");
    } catch (e) {
      if (e instanceof AxiosError)
        console.log(
          `ERROR: Failed to deploy ${e.code} ${e.message}`,
          e.response?.data
        );
      else if (e instanceof Error)
        console.log("ERROR: Failed to deploy", e.message);
    }
  })
  .parse(process.argv);
