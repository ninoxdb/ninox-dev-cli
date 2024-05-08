import {expect, test} from '@oclif/test'
import nock from 'nock'
import sinon from 'sinon'

import DownloadCommand from '../../src/commands/download.js'
import {loadJsonMock} from '../common/test-utils.js'

describe('download', () => {
  let stubReadEnvironmentConfig: sinon.SinonStub
  const dbId = '4321'
  before(() => {
    const databaseJSONMock = loadJsonMock('download-database-info.json')
    // const databaseJSONMock =  require('../mocks/database-info.json');
    nock('https://mocked.example.com')
      .get(`/v1/teams/mocked-workspace/databases/${dbId}?human=T`)
      .reply(200, databaseJSONMock)

    nock('https://mocked.example.com').get(`/mocked-workspace/${dbId}/files/background.jpg`).reply(200, 'mocked-image')

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
    .command(['download', '--id', dbId])
    .it('runs download', (ctx) => {
      expect(ctx.stdout).to.contain(`Downloaded database ${dbId} successfully!`)
    })
  test
    .stderr()
    .command(['download', dbId])
    .catch((error) => {
      expect(error.message).to.contain(`Unexpected argument: ${dbId}\nSee more help with --help`)
      expect((error as any).oclif.exit).to.equal(2)
    })
    .it(`Should throw exception when run download with argument instead of flag i.e download ${dbId}`, (ctx) => {
      console.log(ctx.stderr)
    })
})
