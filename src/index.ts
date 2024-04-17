import { Command } from "commander";

const figlet = require("figlet");

const program = new Command();

console.log(figlet.textSync("Ninox CLI SDK"));

program
  .version("0.0.1")
  .description("Ninox CLI SDK")
  .command("init", "Initialize a new Ninox SDK project", {
    executableFile: "init",
  })
  .command("object:import", "Import an object from Ninox", {
    executableFile: "object-import",
  })
  .parse(process.argv);
