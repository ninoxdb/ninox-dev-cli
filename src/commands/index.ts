#!/usr/bin/env node
import { Command } from "commander";

const figlet = require("figlet");

const program = new Command();

console.log(figlet.textSync("Ninox SDK CLI"));

program
  .version("0.0.1")
  .description("Ninox CLI SDK")
  .command("init", "Initialize a new Ninox SDK project", {
    executableFile: "init",
  })
  .command("object:import", "Import an object from Ninox", {
    executableFile: "object-import",
  })
  .command("deploy", "Deploy a Ninox SDK project", {executableFile: "deploy"})
  .parse(process.argv);
