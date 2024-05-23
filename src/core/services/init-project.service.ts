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
    await this.createPackageJson(name)
    await this.createConfigYaml()
    await this.ensureRootDirectoryStructure()
  }

  private buildPackageJsonContent(name: string, description: string): string {
    const packageJsonFile = {...templatePackageJson, description, name}
    return JSON.stringify(packageJsonFile, undefined, 2)
  }

  private async createConfigYaml(): Promise<void> {
    const credentialsFilePath = PathsUtils.credentialsFilePath(this.basePath)
    if (this.fsUtil.fileExists(credentialsFilePath)) return

    await this.fsUtil.writeFile(credentialsFilePath, yaml.dump(ConfigYamlTemplate))
  }

  private async createPackageJson(
    name: string = DEFAULT_NAME,
    description: string = DEFAULT_DESCRIPTION,
  ): Promise<void> {
    const packageJsonFilePath = PathsUtils.packageJsonFilePath()
    if (this.fsUtil.fileExists(packageJsonFilePath)) return

    const packageJsonContent = this.buildPackageJsonContent(name, description)
    await this.fsUtil.writeFile(packageJsonFilePath, packageJsonContent)
  }

  private async ensureRootDirectoryStructure(): Promise<void> {
    await Promise.all([
      this.fsUtil.mkdir(PathsUtils.objectsPath(this.basePath), {recursive: true}),
      this.fsUtil.mkdir(PathsUtils.filesPath(this.basePath), {recursive: true}),
    ])
  }
}
