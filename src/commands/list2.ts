import { BaseCommand } from './base.js';

export default class List2 extends BaseCommand {

static description = 'List tasks';

  needsEnvironment(): boolean {
    return true;
  }

  async run() {
    const { args, argv } = await this.parse(List2);
    this.log(`${JSON.stringify(args)}`, argv);
    // const { workspaceId } = this.environment!;

    // const response = await fetch(`${domain}tasks`, {
    //   headers: {
    //     'x-api-key': apiKey,
    //     'x-workspace-id': workspaceId,
    //   },
    // });

    // if (!response.ok) {
    //   this.error(`Failed to fetch tasks: ${response.statusText}`);
    // }

    // const tasks = await response.json();
    // this.log(`Tasks in environment "${workspaceId}":`);
    // console.table(tasks);
  }
}
