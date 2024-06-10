import fs from 'node:fs'
import path from 'node:path'

import {CREDENTIALS_FILE_NAME} from '../common/constants.js'

export class FSUtil {
  // TODO: if required inject node:fs to make it testable
  public async checkFileExists(file: string): Promise<boolean> {
    return fs.promises
      .access(file, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false)
  }

  public existsSync(filePath: string): boolean {
    return fs.existsSync(filePath)
  }

  // Then many methods here can be removed, since they only wrap the fs methods e.g fileExists, mkdir, writeFile
  public fileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }

  public formatObjectFilename(objectType: string, objectId: string): string {
    return `${objectType}_${this.toTitleCase(this.normalizeFileName(objectId))}`
  }

  public isProjectInitialized(): boolean {
    return fs.existsSync(path.join(process.cwd(), CREDENTIALS_FILE_NAME))
  }

  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  public async mkdir(directoryPath: string, options: fs.MakeDirectoryOptions = {recursive: true}): Promise<void> {
    await fs.promises.mkdir(directoryPath, options)
  }

  public normalizeFileName(name: string): string {
    // Replace sequences of non-alphanumeric characters (except underscores) with a single underscore
    return name.replaceAll(/\W+/gi, '_').toLowerCase()
  }

  public async readdir(directoryPath: string): Promise<string[]> {
    return fs.promises.readdir(directoryPath)
  }

  public async readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf8')
  }

  public toTitleCase(string_: string): string {
    return string_.replaceAll(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    })
  }

  public async writeFile(filePath: string, data: string): Promise<void> {
    await fs.promises.writeFile(filePath, data, 'utf8')
  }
}
