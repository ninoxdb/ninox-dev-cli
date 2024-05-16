import {expect, test} from '@oclif/test'
import sinon from 'sinon'

import {FSUtil} from '../../src/core/utils/fs.js'

describe('init', () => {
  const ninoxProjectName = 'ninox-project'
  let fsUtil: FSUtil
  let stubReadEnvironmentConfig: sinon.SinonStub
  let fsExistsSyncStub: sinon.SinonStub
  let writeFileStub: sinon.SinonStub
  before(() => {
    fsUtil = new FSUtil()
    stubReadEnvironmentConfig = sinon.stub(fsUtil, 'mkdir').callsFake(() => Promise.resolve())
    fsExistsSyncStub = sinon.stub(fsUtil, 'fileExists').callsFake(() => false)
    writeFileStub = sinon.stub(fsUtil, 'writeFile').callsFake(() => Promise.resolve())
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
