import fs from 'node:fs'
import * as fsAsync from 'node:fs/promises'
import path from 'node:path'

import {CREDENTIALS_FILE_NAME} from '../common/constants.js'

export class FSUtil {
  // TODO: if required inject fs and fsAsync to make it testable

  public fileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }

  public getObjectFileName(objectType: string, objectId: string): string {
    return `${objectType}_${this.normalizeFileName(objectId)}`
  }

  public isProjectInitialized(): boolean {
    return fs.existsSync(path.join(process.cwd(), CREDENTIALS_FILE_NAME))
  }

  public async mkdir(directoryPath: string, options: fs.MakeDirectoryOptions): Promise<void> {
    await fsAsync.mkdir(directoryPath, options)
  }

  public async writeFile(filePath: string, data: string): Promise<void> {
    await fsAsync.writeFile(filePath, data, 'utf8')
  }

  private normalizeFileName(name: string): string {
    // Replace sequences of non-alphanumeric characters (except underscores) with a single underscore
    return name.replaceAll(/\W+/gi, '_').toLowerCase()
  }
}
