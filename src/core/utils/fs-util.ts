import fs from 'node:fs'
import * as fsAsync from 'node:fs/promises'
import path from 'node:path'

import {CREDENTIALS_FILE_NAME, ConfigYamlTemplate, DB_BACKGROUND_FILE_NAME} from '../common/constants.js'
import {DBConfigsYaml} from '../common/typings.js'
import {createYamlDocument} from './yaml-util.js'

export class FSUtil {
  // eslint-disable-next-line perfectionist/sort-classes
  public static createConfigYaml = async () => {
    if (this.fileExists(this.credentialsFilePath)) {
      return
    }

    await this.writeFile(this.credentialsFilePath, createYamlDocument(ConfigYamlTemplate).toString())
  }

  public static createDatabaseFolderInFiles = async (databaseId: string) => {
    // create folder src/Files/Database_${databaseid}
    await this.mkdir(path.join(this.filesPath, `Database_${databaseId}`), {
      recursive: true,
    })
  }

  public static createDatabaseFolderInObjects = async (databaseId: string) => {
    // create folder src/Object/Database_${databaseid}
    await this.mkdir(path.join(this.objectsPath, `Database_${databaseId}`), {
      recursive: true,
    })
  }

  public static createPackageJson = async (name: string, description?: string) => {
    const packageJson = {
      description: description ?? '',
      keywords: [],
      name,
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
      version: '1.0.0',
    }
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (this.fileExists(packageJsonPath)) {
      throw new Error(
        'package.json already exists in the current directory. Please change the directory or remove the existing package.json file',
      )
    }

    await this.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
  }

  public static ensureRootDirectoryStructure = async () => {
    await this.mkdir(this.objectsPath, {recursive: true})
    await this.mkdir(this.filesPath, {recursive: true})
  }

  static fileExists = (filePath: string) => fs.existsSync(filePath)

  public static getDbBackgroundImagePath = (databaseId: string) =>
    path.join(this.filesPath, `Database_${databaseId}`, DB_BACKGROUND_FILE_NAME)

  public static getFilePath = (databaseId: string, objectName: string) => {
    if (!fs.existsSync(path.join(this.filesPath, `Database_${databaseId}`))) {
      throw new Error('File path not set')
    }

    return path.join(this.filesPath, `Database_${databaseId}`, `${objectName}.yaml`)
  }

  public static getObjectFileName = (objectType: string, objectId: string) =>
    `${objectType}_${this.normalizeFileName(objectId)}`

  public static getObjectPath = (databaseId: string, objectName: string) => {
    if (!fs.existsSync(path.join(this.objectsPath, `Database_${databaseId}`))) {
      throw new Error('Object path not set')
    }

    return path.join(this.objectsPath, `Database_${databaseId}`, `${objectName}.yaml`)
  }

  public static isDatabaseBackgroundFileExist = (databaseId: string) => {
    const backgroundFilePath = this.getDbBackgroundImagePath(databaseId)
    return fs.existsSync(backgroundFilePath)
  }

  public static isProjectInitialized = () => fs.existsSync(path.join(process.cwd(), CREDENTIALS_FILE_NAME))

  // eslint-disable-next-line perfectionist/sort-classes
  public static mkdir = async (dirPath: string, options: fs.MakeDirectoryOptions) => {
    await fsAsync.mkdir(dirPath, options)
  }

  public static readCredentials = () => {
    if (!fs.existsSync(this.credentialsFilePath)) {
      throw new Error('config.yaml file not found')
    }

    return fs.readFileSync(this.credentialsFilePath, 'utf8')
  }

  public static readDefinedDatabaseConfigsFromFiles = async () => {
    // do a scan of this.objectsPath dir
    // each directory is a isolated database with its own schema, tables and views
    // return an array of database configs
    const databaseConfigs: DBConfigsYaml[] = []
    if (!fs.existsSync(this.objectsPath)) {
      return databaseConfigs
    }

    const databaseFolders = await fsAsync.readdir(this.objectsPath)
    for (const folder of databaseFolders) {
      if (!folder.startsWith('Database_')) {
        continue
      }

      // eslint-disable-next-line no-await-in-loop
      const files = await fsAsync.readdir(path.join(this.objectsPath, folder))
      const databaseFile = files.find((file) => file.startsWith('Database_'))
      if (!databaseFile) {
        throw new Error('Database file not found')
      }

      // eslint-disable-next-line no-await-in-loop
      const database = await fsAsync.readFile(path.join(this.objectsPath, folder, databaseFile), 'utf8')
      const tableFiles = files.filter((file) => file.startsWith('Table_') || file.startsWith('Page_'))
      // eslint-disable-next-line no-await-in-loop
      const tables = await Promise.all(
        tableFiles.map(async (table) => fsAsync.readFile(path.join(this.objectsPath, folder, table), 'utf8')),
      )
      databaseConfigs.push({
        database,
        tables,
      })
    }

    return databaseConfigs
  }

  public static writeFile = async (filePath: string, data: string) => {
    await fsAsync.writeFile(filePath, data, 'utf8')
  }

  static _credentialsFilePath = path.join(process.cwd(), CREDENTIALS_FILE_NAME)

  static _filesPath = path.join(process.cwd(), 'src', 'Files')

  static _objectsPath = path.join(process.cwd(), 'src', 'Objects')

  static get credentialsFilePath(): string {
    return FSUtil._credentialsFilePath
  }

  static get filesPath(): string {
    return FSUtil._filesPath
  }

  static get objectsPath(): string {
    return FSUtil._objectsPath
  }

  private static normalizeFileName(name: string) {
    // Replace sequences of non-alphanumeric characters (except underscores) with a single underscore
    return name.replaceAll(/\W+/gi, '_').toLowerCase()
  }
}
