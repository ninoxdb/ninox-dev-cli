import {expect, test} from '@oclif/test'
import sinon from 'sinon'

import {FSUtil} from '../../../src/core/utils/fs.js'

describe('project/init', () => {
  const ninoxProjectName = 'ninox-project'
  let stubReadEnvironmentConfig: sinon.SinonStub
  let fsExistsSyncStub: sinon.SinonStub
  let writeFileStub: sinon.SinonStub
  before(() => {
    stubReadEnvironmentConfig = sinon.stub(FSUtil.prototype, 'mkdir').callsFake(() => Promise.resolve())
    fsExistsSyncStub = sinon.stub(FSUtil.prototype, 'fileExists').callsFake(() => false)
    writeFileStub = sinon.stub(FSUtil.prototype, 'writeFile').callsFake(() => Promise.resolve())
  })

  after(() => {
    stubReadEnvironmentConfig.restore()
    fsExistsSyncStub.restore()
    writeFileStub.restore()
  })

  test
    .stdout()
    .command(['project init', ninoxProjectName])
    .it('init commmand: Should initialize the project and exit successfully', (context) => {
      expect(context.stdout).to.contain(`Initialized Ninox project ${ninoxProjectName} successfully!`)
    })
})
