import 'reflect-metadata'
import sinon from 'sinon'
import {container} from 'tsyringe'

import {FsUtil} from '../utils/fs.utils.js'
import {PathsUtils} from '../utils/paths.utils.js'
import {InitProjectService} from './init-project.service.js'

describe('InitProjectService', () => {
  let fsUtilMock: sinon.SinonStubbedInstance<FsUtil>
  let initProjectService: InitProjectService
  const basePath = '/tmp/test'

  beforeEach(() => {
    fsUtilMock = {
      fileExists: sinon.stub(),
      mkdir: sinon.stub(),
      writeFile: sinon.stub(),
    } as sinon.SinonStubbedInstance<FsUtil>

    container.register(FsUtil, {useValue: fsUtilMock})
    container.register('BasePath', {useValue: basePath})
    initProjectService = container.resolve(InitProjectService)
  })

  afterEach(() => {
    container.clearInstances()
  })

  it('expects to create package.json and credentials file with given project name', async () => {
    fsUtilMock.writeFile.resolves()

    await initProjectService.initialiseProject('test-project')
    sinon.assert.calledTwice(fsUtilMock.writeFile)
    sinon.assert.calledTwice(fsUtilMock.mkdir)

    sinon.assert.calledWith(fsUtilMock.writeFile, PathsUtils.packageJsonFilePath(), sinon.match.string)

    sinon.assert.calledWith(fsUtilMock.writeFile, PathsUtils.credentialsFilePath(basePath), sinon.match.string)

    sinon.assert.calledWith(fsUtilMock.mkdir, PathsUtils.objectsPath(basePath), {recursive: true})
    sinon.assert.calledWith(fsUtilMock.mkdir, PathsUtils.filesPath(basePath), {recursive: true})
  })

  it('expects not to overwrite config YAML if it already exists', async () => {
    fsUtilMock.fileExists.withArgs(PathsUtils.credentialsFilePath(basePath)).returns(true)

    await initProjectService.initialiseProject('test-project')

    sinon.assert.calledOnce(fsUtilMock.writeFile)
    sinon.assert.calledWith(fsUtilMock.writeFile, PathsUtils.packageJsonFilePath(), sinon.match.string)
    sinon.assert.neverCalledWith(fsUtilMock.writeFile, PathsUtils.credentialsFilePath(basePath), sinon.match.string)
  })

  it('expects not to overwrite package JSON if it already exists', async () => {
    fsUtilMock.fileExists.withArgs(PathsUtils.packageJsonFilePath()).returns(true)

    await initProjectService.initialiseProject('test-project')
    sinon.assert.calledOnce(fsUtilMock.writeFile)

    sinon.assert.neverCalledWith(fsUtilMock.writeFile, PathsUtils.packageJsonFilePath(), sinon.match.string)
    sinon.assert.calledWith(fsUtilMock.writeFile, PathsUtils.credentialsFilePath(basePath), sinon.match.string)
  })
})
