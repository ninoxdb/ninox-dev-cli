import {expect} from 'chai'
import sinon from 'sinon'
import {z} from 'zod'

import {
  Database,
  DatabaseSchema,
  DatabaseSchemaBaseType,
  DatabaseSchemaInFileType,
  DatabaseSchemaType,
  TableBase,
  TableBaseType,
  TableFile,
  TableFileType,
} from '../../../src/core/common/schema-validators.js'
import {NinoxProjectService} from '../../../src/core/services/ninoxproject-service.js'
import {FSUtil} from '../../../src/core/utils/fs.js'

describe('NinoxProjectService', () => {
  const databaseId = '1234'
  const projectName = 'testProject'
  let fsUtil: FSUtil
  let ninoxProjectService: NinoxProjectService
  let sandbox: sinon.SinonSandbox & sinon.SinonStubbedInstance<typeof FSUtil>
  const FSUtilStubs = {
    fileExists: sinon.stub(),
    mkdir: sinon.stub(),
    writeFile: sinon.stub(),
  }
  const NinoxProjectServiceStubs = {
    createConfigYaml: sinon.stub(),
    createDatabaseFolderInFiles: sinon.stub(),
    createDatabaseFolderInObjects: sinon.stub(),
    createPackageJson: sinon.stub(),
    ensureRootDirectoryStructure: sinon.stub(),
    readDBConfig: sinon.stub(),
  }
  const testSchemaBase: DatabaseSchemaBaseType = {
    afterOpen: 'alert(---Guten Morgen---)',
    afterOpenBehavior: 'restoreNavigation',
    compatibility: 'latest',
    dateFix: 'enabled',
    fileSync: 'full',
    globalCode: '0',
    hideCalendar: false,
    hideDatabase: false,
    hideNavigation: false,
    hideSearch: false,
    knownDatabases: [],
    nextTypeId: 2,
    version: 33,
  }

  const testSchemaInFile: DatabaseSchemaInFileType = {
    ...testSchemaBase,
    _database: '4321',
  }

  const testSchema: DatabaseSchemaType = {
    ...testSchemaBase,
    types: {},
  }

  const testTable: TableBaseType = {
    afterCreate: '(var x := 1; ((x+( = A));(A := x)))',
    afterUpdate: '(var x := 1; ((x+( = A));(A := x)))',
    caption: 'Table112~!   @#$%^&*`@#$%^&*()$%^&*(',
    captions: {},
    fields: {},
    globalSearch: true,
    hidden: false,
    kind: 'table',
    nextFieldId: 5,
    order: 0,
    uis: {},
    uuid: 'mAQsbi4gWS3eLKa2',
  }

  const testTableInFile: TableFileType = {
    table: {
      _database: '4321',
      _id: 'A',
      ...testTable,
    },
  }

  const testTablesInFile: TableFileType[] = [testTableInFile]

  const testDatabase = {id: 'db1', settings: {color: 'color1', icon: 'icon1', name: 'TestDB'}}
  // TODO: add mock views and reports

  beforeEach(() => {
    // Resetting environment for each test
    sandbox = sinon.createSandbox() as sinon.SinonSandbox & sinon.SinonStubbedInstance<typeof FSUtil>
    fsUtil = new FSUtil()
    ninoxProjectService = new NinoxProjectService(fsUtil, {debug: sinon.stub()}, databaseId)

    // TODO: check which methods are  necessary to stub from the NinoxProjectService, otherwise make them private
    NinoxProjectServiceStubs.readDBConfig = sandbox
      .stub(ninoxProjectService, 'readDBConfig')
      .resolves({database: `database:\n  id: 123`, reports: [], tables: [], views: []})
    NinoxProjectServiceStubs.createPackageJson = sandbox.stub(ninoxProjectService, 'createPackageJson')
    NinoxProjectServiceStubs.createConfigYaml = sandbox.stub(ninoxProjectService, 'createConfigYaml')
    NinoxProjectServiceStubs.ensureRootDirectoryStructure = sandbox.stub(
      ninoxProjectService,
      'ensureRootDirectoryStructure',
    )
    NinoxProjectServiceStubs.createDatabaseFolderInObjects = sandbox.stub(
      ninoxProjectService,
      'createDatabaseFolderInObjects',
    )

    // Stubbing FSUtil methods
    FSUtilStubs.writeFile = sandbox.stub(fsUtil, 'writeFile').resolves()
    FSUtilStubs.mkdir = sandbox.stub(fsUtil, 'mkdir').resolves()
    FSUtilStubs.fileExists = sandbox.stub(fsUtil, 'fileExists').returns(true)
  })

  afterEach(() => {
    // Restore the original state of all stubbed methods
    sandbox.restore()
  })

  describe('createDatabaseFolderInFiles', () => {
    it('should call FSUtil.createDatabaseFolderInFiles with correct database ID', async () => {
      await ninoxProjectService.createDatabaseFolderInFiles()
      // sinon.assert.calledWith(FSUtilStubs.createDatabaseFolderInFiles, databaseId)
      sinon.assert.calledWith(FSUtilStubs.mkdir, ninoxProjectService.getDatabaseFilesPath())
    })
  })

  describe('initialiseProject', () => {
    before(() => {
      FSUtilStubs.fileExists.returns(false)
    })
    it('should call necessary FSUtil methods to initialize a project', async () => {
      await ninoxProjectService.initialiseProject(projectName)
      sinon.assert.calledOnce(NinoxProjectServiceStubs.createPackageJson)
      sinon.assert.calledOnce(NinoxProjectServiceStubs.createConfigYaml)
      sinon.assert.calledOnce(NinoxProjectServiceStubs.ensureRootDirectoryStructure)
    })
    after(() => {
      FSUtilStubs.fileExists.returns(true)
    })
  })

  describe('parseDatabaseConfigs', () => {
    it('should throw an error if database or schema parsing fails', () => {
      sandbox.stub(Database, 'safeParse').returns({error: new z.ZodError([]), success: false})
      sandbox.stub(DatabaseSchema, 'safeParse').returns({error: new z.ZodError([]), success: false})
      expect(() => ninoxProjectService.parseDatabaseConfigs({}, {}, [], [])).to.throw(
        'Validation errors: Database validation failed',
      )
    })

    it('should return a correctly parsed object if database and schema are valid', () => {
      sandbox
        .stub(Database, 'safeParse')
        .returns({data: {id: 'db1', settings: {color: 'color1', icon: 'icon1', name: 'db1'}}, success: true})
      sandbox.stub(DatabaseSchema, 'safeParse').returns({data: testSchema, success: true})
      sandbox.stub(TableBase, 'safeParse').returns({data: testTable, success: true})
      sandbox.stub(TableFile, 'parse').returns(testTableInFile)
      const result = ninoxProjectService.parseDatabaseConfigs({id: 'db1'}, {types: {table1: {}}}, [], [])
      expect(result).to.have.property('database')
      expect(result).to.have.property('schema')
      expect(result).to.have.property('tables')
    })
  })

  describe('writeDatabaseToFiles', () => {
    it('should ensure the root directory structure and write to files', async () => {
      await ninoxProjectService.writeDatabaseToFiles(testDatabase, testSchemaInFile, testTablesInFile, [], [])
      sinon.assert.calledOnce(NinoxProjectServiceStubs.ensureRootDirectoryStructure)
      sinon.assert.calledOnce(NinoxProjectServiceStubs.createDatabaseFolderInObjects)
      expect(FSUtilStubs.writeFile.callCount).to.equal(testTablesInFile.length + 1)
    })
  })

  describe('writeViewsToFiles', () => {
    it('should handle views with duplicate captions by creating unique filenames', async () => {
      // Setup test data
      const viewsByTable = {
        N: [
          {
            view: {
              _database: 'rgqpdljgtqza',
              _table: 'Angebote',
              caption: 'Tabelle',
              config: {
                descending: true,
                sort: 0,
                type: 'N',
              },
              id: 'mn6V9gsBj1EQ2HKT',
              mode: 'table',
              order: 40,
              type: 'N',
            },
          },
          {
            view: {
              _database: 'rgqpdljgtqza',
              _table: 'Angebote',
              caption: 'Tabelle',
              config: {
                descending: false,
                sort: 6,
                type: 'N',
              },
              id: 'u9yHP9YsbtFvtQAZ',
              mode: 'table',
              order: 30,
              type: 'N',
            },
          },
        ],
      }

      const tableFolders = {
        N: '/path/to/table/folder',
      }

      // Create stubs using sinon
      const mockFsUtil = {
        formatObjectFilename: sinon.stub().callsFake((prefix, name) => `${prefix}_${name}`),
        mkdir: sinon.stub().resolves(),
        writeFile: sinon.stub().resolves(),
      }

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const service = new NinoxProjectService(mockFsUtil as unknown as FSUtil, {debug() {}}, 'testDbId')

      // Call the private method
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (service as any).writeViewsToFiles(viewsByTable, tableFolders)

      // Verify that writeFile was called twice
      expect(mockFsUtil.writeFile.callCount).to.equal(2)

      // Get all calls to writeFile
      const writeFileCalls = mockFsUtil.writeFile.getCalls()

      // First view should use the simple filename
      expect(writeFileCalls[0].args[0]).to.include('view_Tabelle.yaml')

      // Second view should include the ID in the filename
      expect(writeFileCalls[1].args[0]).to.include('view_Tabelle_u9yHP9YsbtFvtQAZ.yaml')

      // Verify the content of the files is correct
      expect(writeFileCalls[0].args[1]).to.include('descending: true')
      expect(writeFileCalls[1].args[1]).to.include('descending: false')
    })

    // Clean up after each test
    afterEach(() => {
      sinon.restore()
    })
  })
})
