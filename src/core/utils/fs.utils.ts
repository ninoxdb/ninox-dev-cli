import fs from 'node:fs'
import fsAsync from 'node:fs/promises'
import {autoInjectable, inject} from 'tsyringe'

@autoInjectable()
export class FsUtil {
  public constructor(@inject('BasePath') private readonly basePath: string) {
    this.basePath = this.basePath ?? process.cwd()
  }

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
