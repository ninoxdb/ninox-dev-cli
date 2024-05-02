import { Command } from "commander";
import { run } from "../handlers/deploy-handler";
import { AxiosError } from "axios";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../common/constants";

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
      await run(options, JSON.parse(process.env.ENVIRONMENT ?? ""));
      console.log(SUCCESS_MESSAGES.DEPLOY_SUCCESS);
    } catch (e) {
      if (e instanceof AxiosError)
        console.log(
          `${ERROR_MESSAGES.DEPLOY_FAILED} ${e.code} ${e.message}`,
          e.response?.data
        );
      else if (e instanceof Error)
        console.log(ERROR_MESSAGES.DEPLOY_FAILED, e.message);
    }
  })
  .parse(process.argv);
