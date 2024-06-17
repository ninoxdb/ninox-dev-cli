import {expect, test} from '@oclif/test'
import nock from 'nock'
import sinon from 'sinon'

import List from '../../../src/commands/database/list.js'
import {DatabaseMetadata} from '../../../src/core/common/schema-validators.js'
import {loadJsonMock, mockNinoxEnvironment} from '../../common/test-utils.js'
describe('database/list', () => {
  let stubReadEnvironmentConfig: sinon.SinonStub
  const databaseList = loadJsonMock('list-databases.json') as DatabaseMetadata[]
  before(() => {
    stubReadEnvironmentConfig = sinon
      .stub(List.prototype, 'readEnvironmentConfig')
      .callsFake(() => mockNinoxEnvironment)
    nock('https://mocked.example.com')
      .get(`/v1/teams/${mockNinoxEnvironment.workspaceId}/databases`)
      .reply(200, databaseList)
  })
  after(() => {
    stubReadEnvironmentConfig.restore()
  })

  test
    .stdout()
    .command(['database list'])
    .it('list Databases', (context) => {
      for (const database of databaseList) {
        expect(context.stdout).to.match(new RegExp(`${database.id}`))
      }
    })

  test
    .stderr()
    .command(['database list', '--name', 'value'])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((error: any) => {
      expect(error.message).to.contain('Nonexistent flag: --name')
      expect(error.oclif.exit).to.equal(2)
    })
    .it('errors with non-existent flag', (context) => {
      console.log(context.stderr)
    })
  // TODO: Following test cases are pending
  // invalid config.yml
  // invalid db id
  // invalid api key
  // handling of invalid credentials
})
