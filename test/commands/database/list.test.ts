import {expect, test} from '@oclif/test'
import nock from 'nock'
import sinon from 'sinon'

import List from '../../../src/commands/database/list.js'
import {DatabaseMetadata} from '../../../src/core/common/schema-validators.js'
import {loadJsonMock, mockNinoxEnvironment} from '../../common/test-utils.js'
describe('database/list', () => {
  let stubReadEnvironmentConfig: sinon.SinonStub
  const dbList = loadJsonMock('list-databases.json')
  before(() => {
    stubReadEnvironmentConfig = sinon
      .stub(List.prototype, 'readEnvironmentConfig')
      .callsFake(() => mockNinoxEnvironment)
    nock('https://mocked.example.com').get(`/v1/teams/${mockNinoxEnvironment.workspaceId}/databases`).reply(200, dbList)
  })
  after(() => {
    stubReadEnvironmentConfig.restore()
  })

  test
    .stdout()
    .command(['database list'])
    .it('list Databases', (ctx) => {
      expect(ctx.stdout).to.contain(dbList.map((db: DatabaseMetadata) => `${db.name} ${db.id}`).join('\n'))
    })

  test
    .stderr()
    .command(['database list', '--name', 'value'])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((error: any) => {
      expect(error.message).to.contain('Nonexistent flag: --name')
      expect(error.oclif.exit).to.equal(2)
    })
    .it('errors with non-existent flag', (ctx) => {
      console.log(ctx.stderr)
    })
    // TODO: Following test cases are pending
    // invalid config.yml
    // invalid db id
    // invalid api key
    // handling of invalid credentials
})
