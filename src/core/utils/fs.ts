import * as yaml from 'js-yaml'
import fs from 'node:fs'
import * as fsAsync from 'node:fs/promises'
import path from 'node:path'

import {
  CREDENTIALS_FILE_NAME,
  ConfigYamlTemplate,
  DB_BACKGROUND_FILE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_NAME,
  DEFAULT_VERSION,
} from '../common/constants.js'
import {DBConfigsYaml} from '../common/types.js'

export class FSUtil {
  static readonly credentialsFilePath = path.join(process.cwd(), CREDENTIALS_FILE_NAME)
  static readonly filesPath = path.join(process.cwd(), 'src', 'Files')

  static readonly objectsPath = path.join(process.cwd(), 'src', 'Objects')

  public static async createConfigYaml() {
    if (this.fileExists(this.credentialsFilePath)) {
      return
    }

    await this.writeFile(this.credentialsFilePath, yaml.dump(ConfigYamlTemplate))
  }

  // create folder src/Files/Database_${databaseid}
  public static async createDatabaseFolderInFiles(databaseId: string) {
    await this.mkdir(path.join(this.getDatabaseFilesDirectoryPath(databaseId)), {
      recursive: true,
    })
  }

  // create folder src/Object/Database_${databaseid}
  public static async createDatabaseFolderInObjects(databaseId: string) {
    return this.mkdir(this.getDatabaseObjectsDirectoryPath(databaseId), {
      recursive: true,
    })
  }

  public static async createPackageJson(name: string = DEFAULT_NAME, description: string = DEFAULT_DESCRIPTION) {
    const packageJson = {
      description,
      keywords: [],
      name,
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
      version: DEFAULT_VERSION,
    }
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (this.fileExists(packageJsonPath)) {
      throw new Error(
        'package.json already exists in the current directory. Please change the directory or remove the existing package.json file',
      )
    }

    await this.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
  }

  public static async ensureRootDirectoryStructure() {
    await this.mkdir(this.objectsPath, {recursive: true})
    await this.mkdir(this.filesPath, {recursive: true})
  }

  static fileExists(filePath: string) {
    return fs.existsSync(filePath)
  }

  static getDatabaseFilesDirectoryPath(databaseId: string) {
    return path.join(this.filesPath, `Database_${databaseId}`)
  }

  static getDatabaseObjectsDirectoryPath(databaseId: string) {
    return path.join(this.objectsPath, `Database_${databaseId}`)
  }

  public static getDbBackgroundImagePath(databaseId: string) {
    return path.join(this.getDatabaseFilesDirectoryPath(databaseId), DB_BACKGROUND_FILE_NAME)
  }

  public static getFilePath(databaseId: string, objectName: string) {
    if (!fs.existsSync(this.getDatabaseFilesDirectoryPath(databaseId))) {
      throw new Error('File path not set')
    }

    return path.join(this.getDatabaseFilesDirectoryPath(databaseId), `${objectName}.yaml`)
  }

  public static getObjectFileName(objectType: string, objectId: string) {
    return `${objectType}_${this.normalizeFileName(objectId)}`
  }

  public static getObjectPath(databaseId: string, objectName: string) {
    const databaseFolderPath = this.getDatabaseObjectsDirectoryPath(databaseId)
    if (!fs.existsSync(databaseFolderPath)) {
      throw new Error(`Database folder not found: ${databaseFolderPath}`)
    }

    return path.join(this.getDatabaseObjectsDirectoryPath(databaseId), `${objectName}.yaml`)
  }

  public static isDatabaseBackgroundFileExist(databaseId: string) {
    const backgroundFilePath = this.getDbBackgroundImagePath(databaseId)
    return fs.existsSync(backgroundFilePath)
  }

  public static isProjectInitialized() {
    return fs.existsSync(path.join(process.cwd(), CREDENTIALS_FILE_NAME))
  }

  public static async mkdir(dirPath: string, options: fs.MakeDirectoryOptions) {
    await fsAsync.mkdir(dirPath, options)
  }

  public static readCredentials() {
    if (!fs.existsSync(this.credentialsFilePath)) {
      throw new Error('config.yaml file not found')
    }

    return fs.readFileSync(this.credentialsFilePath, 'utf8')
  }

  public static async readDatabaseConfig(databaseId: string) {
    return this.readDBConfigFromFolder(this.getDatabaseObjectsDirectoryPath(databaseId))
  }

  public static async readDefinedDatabaseConfigsFromFiles() {
    // do a scan of this.objectsPath dir
    // each directory is a isolated database with its own schema, tables and views
    // return an array of database configs
    const databaseConfigs: Promise<DBConfigsYaml>[] = []
    if (!fs.existsSync(this.objectsPath)) {
      return databaseConfigs
    }

    const databaseFolders = await fsAsync.readdir(this.objectsPath)
    for (const folder of databaseFolders) {
      if (!folder.startsWith('Database_')) {
        continue
      }

      databaseConfigs.push(this.readDBConfigFromFolder(path.join(this.objectsPath, folder)))
    }

    return Promise.all(databaseConfigs)
  }

  public static async writeFile(filePath: string, data: string) {
    await fsAsync.writeFile(filePath, data, 'utf8')
  }

  private static normalizeFileName(name: string) {
    // Replace sequences of non-alphanumeric characters (except underscores) with a single underscore
    return name.replaceAll(/\W+/gi, '_').toLowerCase()
  }

  private static async readDBConfigFromFolder(databaseFolderPath: string) {
    if (!fs.existsSync(databaseFolderPath)) {
      throw new Error(`Database folder not found: ${databaseFolderPath}`)
    }

    const files = await fsAsync.readdir(databaseFolderPath)
    const databaseFile = files.find((file) => file.startsWith('Database_'))
    if (!databaseFile) {
      throw new Error('Database file not found')
    }

    const database = await fsAsync.readFile(path.join(databaseFolderPath, databaseFile), 'utf8')
    const tableFiles = files.filter((file) => file.startsWith('Table_') || file.startsWith('Page_'))

    const tables = await Promise.all(
      tableFiles.map((table) => fsAsync.readFile(path.join(databaseFolderPath, table), 'utf8')),
    )
    return {
      database,
      tables,
    } satisfies DBConfigsYaml
  }
}
