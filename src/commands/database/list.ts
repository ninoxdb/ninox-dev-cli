import {BaseCommand} from '../../core/common/base.js'
import {DatabaseMetadata} from '../../core/common/schemas.js'
import {EnvironmentConfig} from '../../core/utils/config.js'
import {NinoxClient} from '../../core/utils/ninox-client.js'

export default class List extends BaseCommand {
  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  private handle = async (): Promise<void> => {
    const dbs = (await NinoxClient.listDatabases(this.environment as EnvironmentConfig)) as DatabaseMetadata[]
    for (const db of dbs) {
      this.log(db.name, db.id)
    }
  }

  public async run(): Promise<void> {
    await this.parse(List)
    await this.handle()
    this.debug(`hello from /Users/muhammad/Code/Ninox/database-cli/src/commands/list.ts`)
  }
}
