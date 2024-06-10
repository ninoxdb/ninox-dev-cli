import fs from 'node:fs'
import * as fsAsync from 'node:fs/promises'
import path from 'node:path'

import {CREDENTIALS_FILE_NAME} from '../common/constants.js'

export class FSUtil {
  // TODO: if required inject fs and fsAsync to make it testable
  // Then many methods here can be removed, since they only wrap the fs methods e.g fileExists, mkdir, writeFile
  public fileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }

  public getObjectFileName(objectType: string, objectId: string): string {
    return `${objectType}_${this.normalizeFileName(objectId)}`
  }

  public isProjectInitialized(): boolean {
    return fs.existsSync(path.join(process.cwd(), CREDENTIALS_FILE_NAME))
  }

  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  public async mkdir(directoryPath: string, options: fs.MakeDirectoryOptions = {recursive: true}): Promise<void> {
    await fsAsync.mkdir(directoryPath, options)
  }

  public normalizeFileName(name: string): string {
    // Replace sequences of non-alphanumeric characters (except underscores) with a single underscore
    return name.replaceAll(/\W+/gi, '_').toLowerCase()
  }

  public async writeFile(filePath: string, data: string): Promise<void> {
    await fsAsync.writeFile(filePath, data, 'utf8')
  }
}
