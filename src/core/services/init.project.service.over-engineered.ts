import * as yaml from 'js-yaml'
import {autoInjectable, inject} from 'tsyringe'

import {ConfigYamlTemplate, DEFAULT_DESCRIPTION, DEFAULT_NAME} from '../common/constants.js'
import {FsUtil} from '../utils/fs.utils.js'
import {PathsUtils} from '../utils/paths.utils.js'

const templatePackageJson = {
  description: '',
  keywords: [],
  name: '',
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
  },
  version: '#DEFAULT_VERSION#',
}

@autoInjectable()
export class InitProjectService {
  public constructor(
    private readonly fsUtil: FsUtil,
    @inject('BasePath') private readonly basePath: string,
  ) {}

  public async initialiseProject(name: string): Promise<void> {
    await Promise.all([this.createPackageJson(name), this.createConfigYaml(), this.ensureRootDirectoryStructure()])
  }

  private buildPackageJsonContent(name: string, description: string): string {
    const packageJsonFile = {...templatePackageJson, description, name}
    return JSON.stringify(packageJsonFile, undefined, 2)
  }

  private async createConfigYaml(): Promise<void> {
    const credentialsFilePath = PathsUtils.credentialsFilePath(this.basePath)
    if (await this.fileExists(credentialsFilePath)) return

    const yamlContent = yaml.dump(ConfigYamlTemplate)
    await this.writeFile(credentialsFilePath, yamlContent)
  }

  private async createPackageJson(
    name: string = DEFAULT_NAME,
    description: string = DEFAULT_DESCRIPTION,
  ): Promise<void> {
    const packageJsonFilePath = PathsUtils.packageJsonFilePath()
    if (await this.fileExists(packageJsonFilePath)) return

    const packageJsonContent = this.buildPackageJsonContent(name, description)
    await this.writeFile(packageJsonFilePath, packageJsonContent)
  }

  private async ensureDirectoryExists(directoryPath: string): Promise<void> {
    await this.fsUtil.mkdir(directoryPath, {recursive: true})
  }

  private async ensureRootDirectoryStructure(): Promise<void> {
    await Promise.all([
      this.ensureDirectoryExists(PathsUtils.objectsPath(this.basePath)),
      this.ensureDirectoryExists(PathsUtils.filesPath(this.basePath)),
    ])
  }

  private async fileExists(filePath: string): Promise<boolean> {
    return this.fsUtil.fileExists(filePath)
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    await this.fsUtil.writeFile(filePath, content)
  }
}
