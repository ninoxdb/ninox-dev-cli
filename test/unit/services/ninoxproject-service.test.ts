import {expect} from 'chai'
import path from 'node:path'
import sinon from 'sinon'
import {z} from 'zod'

import {Database, DatabaseSchema, TableBase, TableFile} from '../../../src/core/common/schema-validators.js'
import {NinoxProjectService} from '../../../src/core/services/ninoxproject-service.js'
import {FSUtil} from '../../../src/core/utils/fs.js'
import {
  testDatabase,
  testSchema,
  testSchemaInFile,
  testTable,
  testTableInFile,
  testTablesInFile,
} from '../../common/test-utils.js'

describe('NinoxProjectService', () => {
  let ninoxProjectService: NinoxProjectService
  let sandbox: sinon.SinonSandbox & sinon.SinonStubbedInstance<typeof FSUtil>
  const FSUtilStub = {
    createConfigYaml: sinon.stub(),
    createDatabaseFolderInFiles: sinon.stub(),
    createDatabaseFolderInObjects: sinon.stub(),
    createPackageJson: sinon.stub(),
    ensureRootDirectoryStructure: sinon.stub(),
    getObjectPath: sinon.stub(),
    readDatabaseConfig: sinon.stub(),
    writeFile: sinon.stub(),
  }

  beforeEach(() => {
    // Resetting environment for each test
    sandbox = sinon.createSandbox() as sinon.SinonSandbox & sinon.SinonStubbedInstance<typeof FSUtil>
    ninoxProjectService = new NinoxProjectService('testDatabaseId', 'testProject')

    // Stubbing FSUtil methods
    FSUtilStub.createDatabaseFolderInFiles = sandbox.stub(FSUtil, 'createDatabaseFolderInFiles').resolves()
    FSUtilStub.createPackageJson = sandbox.stub(FSUtil, 'createPackageJson').resolves()
    FSUtilStub.createConfigYaml = sandbox.stub(FSUtil, 'createConfigYaml').resolves()
    FSUtilStub.ensureRootDirectoryStructure = sandbox.stub(FSUtil, 'ensureRootDirectoryStructure').resolves()
    FSUtilStub.readDatabaseConfig = sandbox
      .stub(FSUtil, 'readDatabaseConfig')
      .resolves({database: `database:\n  id: 123`, tables: []})
    FSUtilStub.writeFile = sandbox.stub(FSUtil, 'writeFile').resolves()
    FSUtilStub.getObjectPath = sandbox
      .stub(FSUtil, 'getObjectPath')
      .callsFake((databaseId: string, objectName: string) =>
        path.join(FSUtil.getDatabaseObjectsDirectoryPath(databaseId), `${objectName}.yaml`),
      )
    FSUtilStub.createDatabaseFolderInObjects = sandbox.stub(FSUtil, 'createDatabaseFolderInObjects').resolves()
  })

  afterEach(() => {
    // Restore the original state of all stubbed methods
    sandbox.restore()
  })

  describe('createDatabaseFolderInFiles', () => {
    it('should call FSUtil.createDatabaseFolderInFiles with correct database ID', async () => {
      await ninoxProjectService.createDatabaseFolderInFiles()
      sinon.assert.calledWith(FSUtilStub.createDatabaseFolderInFiles, 'testDatabaseId')
    })
  })

  describe('initialiseProject', () => {
    it('should call necessary FSUtil methods to initialize a project', async () => {
      await ninoxProjectService.initialiseProject()
      sinon.assert.calledOnce(FSUtilStub.createPackageJson)
      sinon.assert.calledOnce(FSUtilStub.createConfigYaml)
      sinon.assert.calledOnce(FSUtilStub.ensureRootDirectoryStructure)
    })
  })

  describe('parseData', () => {
    it('should throw an error if database or schema parsing fails', () => {
      sandbox.stub(Database, 'safeParse').returns({error: new z.ZodError([]), success: false})
      sandbox.stub(DatabaseSchema, 'safeParse').returns({error: new z.ZodError([]), success: false})

      expect(() => ninoxProjectService.parseData({}, {})).to.throw(
        'Validation errors: Database or Schema validation failed',
      )
    })

    it('should return a correctly parsed object if database and schema are valid', () => {
      sandbox
        .stub(Database, 'safeParse')
        .returns({data: {id: 'db1', settings: {color: 'color1', icon: 'icon1', name: 'db1'}}, success: true})
      sandbox.stub(DatabaseSchema, 'safeParse').returns({data: testSchema, success: true})
      sandbox.stub(TableBase, 'safeParse').returns({data: testTable, success: true})
      sandbox.stub(TableFile, 'parse').returns(testTableInFile)

      const result = ninoxProjectService.parseData({id: 'db1'}, {types: {table1: {}}})
      expect(result).to.have.property('database')
      expect(result).to.have.property('schema')
      expect(result).to.have.property('tables')
    })
  })

  describe('readDatabaseConfig', () => {
    it('should return parsed database configuration', async () => {
      sandbox
        .stub(ninoxProjectService, 'parseDatabaseAndSchemaFromFileContent')
        .returns({database: testDatabase, schema: testSchema})

      const result = await ninoxProjectService.readDatabaseConfig()
      expect(result).to.have.property('database')
      expect(result).to.have.property('schema')
    })
  })

  describe('writeToFiles', () => {
    it('should ensure the root directory structure and write to files', async () => {
      await ninoxProjectService.writeToFiles(testDatabase, testSchemaInFile, testTablesInFile)
      sinon.assert.calledOnce(FSUtilStub.ensureRootDirectoryStructure)
      sinon.assert.calledOnce(FSUtilStub.createDatabaseFolderInObjects)
      sinon.assert.calledWith(FSUtilStub.writeFile, sinon.match.string, sinon.match.string)
      expect(FSUtilStub.writeFile.callCount).to.equal(testTablesInFile.length + 1)
    })
  })
})
