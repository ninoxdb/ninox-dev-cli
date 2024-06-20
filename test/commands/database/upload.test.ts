import {expect, test} from '@oclif/test'
import nock from 'nock'
import path from 'node:path'
import sinon from 'sinon'

import UploadCommand from '../../../src/commands/database/upload.js'
import {DB_BACKGROUND_FILE_NAME} from '../../../src/core/common/constants.js'
import {NinoxProjectService} from '../../../src/core/services/ninoxproject-service.js'
import {filesPath, mockNinoxEnvironment, objectsPath} from '../../common/test-utils.js'

describe('database/upload', () => {
  let stubReadEnvironmentConfig: sinon.SinonStub
  const databaseId = '4321'
  let credentialsPathStub: sinon.SinonStub
  let filesPathStub: sinon.SinonStub
  let objectsPathStub: sinon.SinonStub
  before(() => {
    nock('https://mocked.example.com')
      .post(`/${mockNinoxEnvironment.workspaceId}/${databaseId}/files/${DB_BACKGROUND_FILE_NAME}`)
      .matchHeader('authorization', 'Bearer mocked-api-key')
      .matchHeader('content-type', /multipart\/form-data/)
      .reply(200, {
        message: 'File uploaded successfully',
        status: 'success',
      })
      .post(`/${mockNinoxEnvironment.workspaceId}/${databaseId}/settings/update`)
      .reply(200)
      .patch(`/v1/teams/${mockNinoxEnvironment.workspaceId}/databases/${databaseId}/schema?human-script=T`)
      .reply(200)
      .post(`/v1/teams/${mockNinoxEnvironment.workspaceId}/databases/${databaseId}/views`)
      .reply(200)
      .post(`/v1/teams/${mockNinoxEnvironment.workspaceId}/databases/${databaseId}/reports`)
      .reply(200)

    credentialsPathStub = sinon
      .stub(NinoxProjectService.prototype, 'getCredentialsPath')
      .get(() => '/mocked/path/to/credentials')
    filesPathStub = sinon
      .stub(NinoxProjectService.prototype, 'getDatabaseFilesPath')
      .returns(path.join(filesPath, `database_${databaseId}`))
    objectsPathStub = sinon
      .stub(NinoxProjectService.prototype, 'getDatabaseObjectsPath')
      .returns(path.join(objectsPath, `database_${databaseId}`))

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
    .command(['database upload', '--id', databaseId])
    .it('Should upload the mock nx-project database files', (context) => {
      expect(context.stdout).to.contain(`Uploaded database ${databaseId} successfully!`)
    })

  // TODO: Another test case where schema version is lower than the current version
})
