import {expect, test} from '@oclif/test'
import nock from 'nock'
import sinon from 'sinon'

import UploadCommand from '../../../src/commands/database/upload.js'
import {DB_BACKGROUND_FILE_NAME} from '../../../src/core/common/constants.js'
import {FSUtil} from '../../../src/core/utils/fs.js'
import {filesPath, mockNinoxEnvironment, objectsPath} from '../../common/test-utils.js'

describe('database/upload', () => {
  let fsUtil: FSUtil
  let stubReadEnvironmentConfig: sinon.SinonStub
  const dbId = '4321'
  let credentialsPathStub: sinon.SinonStub
  let filesPathStub: sinon.SinonStub
  let objectsPathStub: sinon.SinonStub
  before(() => {
    nock('https://mocked.example.com')
      .post(`/${mockNinoxEnvironment.workspaceId}/${dbId}/files/${DB_BACKGROUND_FILE_NAME}`)
      .matchHeader('authorization', 'Bearer mocked-api-key')
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, {
        message: 'File uploaded successfully',
        status: 'success',
      })
      .post(`/${mockNinoxEnvironment.workspaceId}/${dbId}/settings/update`)
      .reply(200)
      .patch(`/v1/teams/${mockNinoxEnvironment.workspaceId}/databases/${dbId}/schema?human=T`)
      .reply(200)
    fsUtil = new FSUtil()
    credentialsPathStub = sinon.stub(fsUtil, 'getCredentialsPath').get(() => '/mocked/path/to/credentials')
    filesPathStub = sinon.stub(fsUtil, 'getFilesPath').get(() => filesPath)
    objectsPathStub = sinon.stub(fsUtil, 'getObjectsPath').get(() => objectsPath)

    stubReadEnvironmentConfig = sinon
      .stub(UploadCommand.prototype, 'readEnvironmentConfig')
      .callsFake(() => mockNinoxEnvironment)
  })

  after(() => {
    stubReadEnvironmentConfig.restore()
    credentialsPathStub.restore()
    filesPathStub.restore()
    objectsPathStub.restore()
  })

  test
    .stdout()
    .command(['database upload', '--id', dbId])
    .it('Should upload the mock nx-project database files', (ctx) => {
      expect(ctx.stdout).to.contain(`Uploaded database ${dbId} successfully!`)
    })

  // TODO: Another test case where schema version is lower than the current version
})
