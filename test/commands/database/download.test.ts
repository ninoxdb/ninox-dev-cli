import {expect, test} from '@oclif/test'
import nock from 'nock'
import sinon from 'sinon'

import DownloadCommand from '../../../src/commands/database/download.js'
import {GetDatabaseResponse} from '../../../src/core/common/schema-validators.js'
import {loadJsonMock} from '../../common/test-utils.js'

describe('database/download', () => {
  let stubReadEnvironmentConfig: sinon.SinonStub
  const workspaceId = 'mocked-workspace'
  const databaseId = '4321'
  let databaseJSONMock: GetDatabaseResponse
  before(() => {
    databaseJSONMock = loadJsonMock('download-database-info.json') as GetDatabaseResponse
    nock('https://mocked.example.com')
      .get(`/v1/teams/${workspaceId}/databases/${databaseId}?human=T`)
      .reply(200, databaseJSONMock)
      .get(`/${workspaceId}/${databaseId}/files/background.jpg`)
      .reply(200, 'mocked-image')
      .get(`/v1/teams/${workspaceId}/databases/${databaseId}/views?fullView=T`)
      .reply(200, [])
      .get(`/v1/teams/${workspaceId}/databases/${databaseId}/reports?fullReport=T`)
      .reply(200, [])

    stubReadEnvironmentConfig = sinon.stub(DownloadCommand.prototype, 'readEnvironmentConfig').callsFake(() => ({
      apiKey: 'mocked-api-key',
      domain: 'https://mocked.example.com',
      workspaceId: 'mocked-workspace',
    }))
  })

  after(() => {
    stubReadEnvironmentConfig.restore()
  })

  test
    .stdout()
    .command(['database download', '--id', databaseId])
    .it('runs download', (context) => {
      expect(context.stdout).to.contain(
        `Downloaded database ${databaseJSONMock.settings.name} (${databaseId}) successfully!`,
      )
    })
  test
    .stderr()
    .command(['database download', databaseId])
    .catch((error) => {
      expect(error.message).to.contain(`Unexpected argument: ${databaseId}\nSee more help with --help`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((error as any).oclif.exit).to.equal(2)
    })
    .it(
      `Should throw exception when run download with argument instead of flag i.e download ${databaseId}`,
      (context) => {
        console.log(context.stderr)
      },
    )
})
