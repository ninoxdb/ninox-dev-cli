import {expect, test} from '@oclif/test'
import sinon from 'sinon'

import InitCommand from '../../src/commands/init.js'
import {FSUtil} from '../../src/core/utils/fs-util.js'

describe('init', () => {
  const ninoxProjectName = 'ninox-project'
  let stubReadEnvironmentConfig: sinon.SinonStub
  let fsExistsSyncStub: sinon.SinonStub
  let writeFileStub: sinon.SinonStub
  before(() => {
    stubReadEnvironmentConfig = sinon.stub(FSUtil, 'mkdir').callsFake(() => Promise.resolve())
    fsExistsSyncStub = sinon.stub(FSUtil, 'fileExists').callsFake(() => false)
    writeFileStub = sinon.stub(FSUtil, 'writeFile').callsFake(() => Promise.resolve())

    sinon.stub(InitCommand.prototype, 'foo').callsFake(() => 'bar')
  })

  after(() => {
    stubReadEnvironmentConfig.restore()
    fsExistsSyncStub.restore()
    writeFileStub.restore()
  })

  test
    .stdout()
    .command(['init', ninoxProjectName])
    .it('init commmand: Should initialize the project and exit successfully', (ctx) => {
      expect(ctx.stdout).to.contain(`Initialized Ninox project ${ninoxProjectName} successfully!`)
    })
})
