import fs from 'node:fs'
import fsAsync from 'node:fs/promises'
import {autoInjectable} from 'tsyringe'

@autoInjectable()
export class FsUtil {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  public constructor() {}

  public fileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }

  public async mkdir(directoryPath: string, options: fs.MakeDirectoryOptions): Promise<void> {
    await fsAsync.mkdir(directoryPath, options)
  }

  public async writeFile(filePath: string, data: string): Promise<void> {
    await fsAsync.writeFile(filePath, data, 'utf8')
  }
}
