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
  private credentialsFilePath: string
  private filesPath: string
  private objectsPath: string

  // TODO: if required inject fs and fsAsync to make it testable
  public constructor(private basePath: string = process.cwd()) {
    this.credentialsFilePath = path.join(this.basePath, CREDENTIALS_FILE_NAME)
    this.filesPath = path.join(this.basePath, 'src', 'Files')
    this.objectsPath = path.join(this.basePath, 'src', 'Objects')
  }

  public async createConfigYaml(): Promise<void> {
    if (this.fileExists(this.credentialsFilePath)) {
      return
    }

    await this.writeFile(this.credentialsFilePath, yaml.dump(ConfigYamlTemplate))
  }

  // create folder src/Files/Database_${databaseid}
  public async createDatabaseFolderInFiles(databaseId: string): Promise<void> {
    return this.mkdir(path.join(this.getDatabaseFilesDirectoryPath(databaseId)), {
      recursive: true,
    })
  }

  // create folder src/Object/Database_${databaseid}
  public async createDatabaseFolderInObjects(databaseId: string): Promise<void> {
    return this.mkdir(this.getDatabaseObjectsDirectoryPath(databaseId), {
      recursive: true,
    })
  }

  public async createPackageJson(
    name: string = DEFAULT_NAME,
    description: string = DEFAULT_DESCRIPTION,
  ): Promise<void> {
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

    await this.writeFile(packageJsonPath, JSON.stringify(packageJson, undefined, 2))
  }

  public async ensureRootDirectoryStructure(): Promise<void> {
    await this.mkdir(this.objectsPath, {recursive: true})
    await this.mkdir(this.filesPath, {recursive: true})
  }

  public fileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }

  public getCredentialsPath(): string {
    return this.credentialsFilePath
  }

  public getDatabaseFilesDirectoryPath(databaseId: string): string {
    return path.join(this.filesPath, `Database_${databaseId}`)
  }

  public getDatabaseObjectsDirectoryPath(databaseId: string): string {
    return path.join(this.objectsPath, `Database_${databaseId}`)
  }

  public getDbBackgroundImagePath(databaseId: string): string {
    return path.join(this.getDatabaseFilesDirectoryPath(databaseId), DB_BACKGROUND_FILE_NAME)
  }

  public getFilePath(databaseId: string, objectName: string): string {
    if (!fs.existsSync(this.getDatabaseFilesDirectoryPath(databaseId))) {
      throw new Error('File path not set')
    }

    return path.join(this.getDatabaseFilesDirectoryPath(databaseId), `${objectName}.yaml`)
  }

  public getFilesPath(): string {
    return this.filesPath
  }

  public getObjectFileName(objectType: string, objectId: string): string {
    return `${objectType}_${this.normalizeFileName(objectId)}`
  }

  public getObjectPath(databaseId: string, objectName: string): string {
    const databaseFolderPath = this.getDatabaseObjectsDirectoryPath(databaseId)
    if (!fs.existsSync(databaseFolderPath)) {
      throw new Error(`Database folder not found: ${databaseFolderPath}`)
    }

    return path.join(this.getDatabaseObjectsDirectoryPath(databaseId), `${objectName}.yaml`)
  }

  public getObjectsPath(): string {
    return this.objectsPath
  }

  public isDatabaseBackgroundFileExist(databaseId: string, imagePath?: string): boolean {
    const backgroundFilePath = imagePath ?? this.getDbBackgroundImagePath(databaseId)
    return fs.existsSync(backgroundFilePath)
  }

  public isProjectInitialized(): boolean {
    return fs.existsSync(path.join(process.cwd(), CREDENTIALS_FILE_NAME))
  }

  public async mkdir(directoryPath: string, options: fs.MakeDirectoryOptions): Promise<void> {
    await fsAsync.mkdir(directoryPath, options)
  }

  // TODO: merge it with the config.ts and add runtime validation
  public readCredentials(): string {
    if (!fs.existsSync(this.credentialsFilePath)) {
      throw new Error('config.yaml file not found')
    }

    return fs.readFileSync(this.credentialsFilePath, 'utf8')
  }

  public async readDatabaseConfigFromFiles(databaseId: string): Promise<DBConfigsYaml> {
    return this.readDBConfigFromFolder(this.getDatabaseObjectsDirectoryPath(databaseId))
  }

  public async readDefinedDatabaseConfigsFromFiles(): Promise<DBConfigsYaml[]> {
    // do a scan of this.objectsPath dir
    // each directory is a isolated database with its own schema, tables and views
    // return an array of database configs
    const databaseConfigs: Promise<DBConfigsYaml>[] = []
    if (!fs.existsSync(this.objectsPath)) {
      return []
    }

    const databaseFolders = await fsAsync.readdir(this.objectsPath)
    for (const folder of databaseFolders) {
      if (!folder.startsWith('Database_')) {
        continue
      }

      databaseConfigs.push(this.readDBConfigFromFolder(path.join(this.objectsPath, folder)))
    }

    const databaseConfigsResolved = await Promise.all(databaseConfigs)
    return databaseConfigsResolved
  }

  public async writeFile(filePath: string, data: string): Promise<void> {
    await fsAsync.writeFile(filePath, data, 'utf8')
  }

  private normalizeFileName(name: string): string {
    // Replace sequences of non-alphanumeric characters (except underscores) with a single underscore
    return name.replaceAll(/\W+/gi, '_').toLowerCase()
  }

  private async readDBConfigFromFolder(databaseFolderPath: string): Promise<DBConfigsYaml> {
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
