import { Command } from "commander";


 const init = new Command('init');

  init
    .description('Initialize a new project')
    .option('-n, --name <name>', 'Name of the project')
    .action((options) => {
      console.log(`Project initialized with name: ${options.name}`);
    })
    .parse(process.argv);