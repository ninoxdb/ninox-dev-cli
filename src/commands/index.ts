#!/usr/bin/env node
import { Command } from "commander";
import { isProjectInitialized, readCredentials } from "../util/fs-util";
import { parseYamlDocument } from "../util/yaml-util";
import { Credentials } from "../common/schemas";
import { ERROR_MESSAGES, HELP_PARAM } from "../common/constants";

const figlet = require("figlet");

const program = new Command();

console.log(figlet.textSync("Ninox SDK CLI"), "\n\n");

preprocessArguments();

program
  .version("0.0.1")
  .description("Ninox CLI SDK")
  .command("init", "Initialize a new Ninox SDK project", {
    executableFile: "init",
  })
  .command("object:import", "Import an object from Ninox", {
    executableFile: "object-import",
  })
  .command("deploy", "Deploy a Ninox SDK project", { executableFile: "deploy" })
  .command("list", "List objects from a live Ninox Account", {
    executableFile: "list",
  })
  .parse(process.argv);

function preprocessArguments() {
  if (process.argv[2] !== "init") {
    if (!isProjectInitialized()) {
      console.log(ERROR_MESSAGES.PROJECT_NOT_INITIALIZED);
      process.exit(1);
    }
    const [env] = process.argv.splice(2, 1);
    if (!env) {
      console.log(ERROR_MESSAGES.ENV_NOT_PROVIDED);
      process.exit(1);
    }
    if (HELP_PARAM.includes(env)) {
      return;
    }
    // try reading the environment file
    try {
      const credsRaw = readCredentials();
      const creds = parseYamlDocument(credsRaw);
      if (!creds?.environments?.[env]) {
        console.log(`${ERROR_MESSAGES.ENV_NOT_FOUND}: ${env}`);
        process.exit(1);
      }
      // sanitise the environment object
      const parsedConfig = Credentials.safeParse(creds.environments[env]);
      if (!parsedConfig.success) {
        console.log(
          `ERROR: "${parsedConfig.error.issues
            .map((issue) => issue.path[0])
            .join(", ")}" is required in the environment defined in config.yaml`
        );
        process.exit(1);
      }
      process.env.ENVIRONMENT = JSON.stringify(parsedConfig.data);
    } catch (e) {
      if (e instanceof Error) {
        console.log(`ERROR: ${e.message}`);
        process.exit(1);
      }
    }
  }
}
