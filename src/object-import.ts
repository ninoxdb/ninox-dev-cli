import { Command } from "commander";
import { doSOmething } from "./common/doParsingTest";

const objectImport = new Command("object:import");

objectImport
  .description("Import an object from Ninox")
  .option("-t, --type <type>", "Object Type e.g Database, Table, View, Field")
  .option("-id, --id <id>", "Object ID")
  .action(async(options) => {
    console.log('object:import command called',options);
    await doSOmething(options);
  })
  .parse(process.argv);


