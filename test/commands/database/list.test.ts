import {expect, test} from '@oclif/test'
import sinon from 'sinon';

import List from '../../../src/commands/database/list.js';
import {NinoxClient} from '../../../src/core/utils/ninox-client.js';
// return this.environment as unknown as sinon.SinonStub<any[], any>;
describe('database/list', () => {
  let stubReadEnvironmentConfig: sinon.SinonStub;
  let anotherFunctionStub: sinon.SinonStub;
  before(() => {
    stubReadEnvironmentConfig = sinon.stub(List.prototype, 'readEnvironmentConfig').callsFake( ()=> 
      ({
        apiKey: 'mocked-api-key',
        domain: 'https://mocked.example.com',
        workspaceId: 'mocked-workspace',
      })
    );
    anotherFunctionStub = sinon.stub(NinoxClient, 'listDatabases').returns(Promise.resolve([
      {
        id: 'mocked-id',
        name: 'mocked-name',
      }
    ])
    );
  });
  after(() => {
    stubReadEnvironmentConfig.restore();
    anotherFunctionStub.restore();
  });


  test
  .stdout()
  .command(['database list'])
  .it('list Databases', ctx => {
    expect(ctx.stdout).to.contain('mocked-id')
  })

  // error case
  // test.stderr()
  // .command(['database list','--name','jeff'])
  // .exit(2)
  // .it('error case', ctx => {
  //   expect(ctx.stderr).to.contain('Nonexistent flag: --name')
  // })

  test
    .stderr()
    .command(['database list', '--nonexistent-flag', 'value'])
    .exit(2)
    // .catch(error => {
    //   expect(error.message).to.contain('Nonexistent flag: --name')
    // })
    .it('errors with non-existent flag', (ctx) => {
      console.log(ctx.stderr);
    })
    
    


})
