import { Command } from "commander";
import { doSOmething } from "./common/doParsingTest";

const objectImport = new Command("object:import");

objectImport
  .description("Import an object from Ninox")
  .option("-t, --type <type>", "Object Type e.g Database, Table, View, Field")
  .option("-id, --id <id>", "Object ID")
  .action((options) => {
    console.log(
      `Project importialized with type: ${options.type} and id: ${options.id}`
    );
    doSOmething(options);
  })
  .parse(process.argv);


