import {expect} from 'chai'
import sinon from 'sinon'

import {DatabaseSchemaType, GetDatabaseResponse, Report, TableFileType, ViewType} from '../common/schema-validators.js'
import {NinoxClient} from '../utils/ninox-client.js'
import {DatabaseService} from './database-service.js'
import {NinoxProjectService} from './ninoxproject-service.js'

describe('DatabaseService', () => {
  let ninoxClientStub: sinon.SinonStubbedInstance<NinoxClient>
  let ninoxProjectServiceStub: sinon.SinonStubbedInstance<NinoxProjectService>
  let databaseService: DatabaseService
  const databaseId = '1234'
  const schemaMock: DatabaseSchemaType = {
    afterOpenBehavior: 'restoreNavigation',
    compatibility: 'latest',
    dateFix: 'enabled',
    fileSync: 'full',
    hideCalendar: false,
    hideDatabase: false,
    hideNavigation: false,
    hideSearch: false,
    knownDatabases: [],
    nextTypeId: 1,
    types: {},
    version: 1,
  }
  const settingsMock = {
    color: 'color',
    icon: 'icon',
    name: 'Database',
  }
  const databaseJSONMock: GetDatabaseResponse = {
    schema: schemaMock,
    settings: settingsMock,
  }
  const databaseInfoMock = {
    id: databaseId,
    settings: settingsMock,
  }

  beforeEach(() => {
    ninoxClientStub = sinon.createStubInstance(NinoxClient)
    ninoxProjectServiceStub = sinon.createStubInstance(NinoxProjectService)
    databaseService = new DatabaseService(ninoxProjectServiceStub, ninoxClientStub, {debug: sinon.stub()}, databaseId)
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('upload', () => {
    it('should call the necessary methods to upload data', async () => {
      const mockBgImagePath = 'path/to/bg/image'
      ninoxProjectServiceStub.readDBConfig.resolves({
        database: '',
        reports: [],
        tables: [],
        views: [],
      })
      ninoxProjectServiceStub.getDbBackgroundImagePath.returns(mockBgImagePath)
      ninoxProjectServiceStub.isDbBackgroundImageExist.returns(true)

      ninoxProjectServiceStub.parseLocalObjectsToNinoxObjects.returns([databaseInfoMock, schemaMock, [], []])

      ninoxClientStub.uploadDatabaseBackgroundImage.resolves()
      ninoxClientStub.updateDatabaseSettingsInNinox.resolves()
      ninoxClientStub.patchDatabaseSchemaInNinox.resolves()
      ninoxClientStub.updateDatabaseViewInNinox.resolves()

      await databaseService.upload()

      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.readDBConfig)
      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.parseLocalObjectsToNinoxObjects, {
        database: '',
        reports: [],
        tables: [],
        views: [],
      })
      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.getDbBackgroundImagePath)
      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.isDbBackgroundImageExist)
      sinon.assert.calledOnceWithExactly(
        ninoxClientStub.uploadDatabaseBackgroundImage,
        databaseId,
        mockBgImagePath,
        true,
      )
    })
  })

  describe('download', () => {
    it('should call the necessary methods to download data', async () => {
      const tablesMock: TableFileType[] = []
      const mockBgImagePath = 'path/to/bg/image'

      ninoxClientStub.getDatabase.resolves(databaseJSONMock)
      ninoxClientStub.getDatabaseViews.resolves([])
      ninoxClientStub.getDatabaseReports.resolves([])
      // TODO: mock views
      ninoxProjectServiceStub.parseDatabaseConfigs.returns({
        database: databaseInfoMock,
        reports: [],
        schema: schemaMock,
        tables: tablesMock,
        views: [],
      })
      ninoxProjectServiceStub.writeDatabaseToFiles.resolves()
      ninoxProjectServiceStub.createDatabaseFolderInFiles.resolves()
      ninoxProjectServiceStub.getDbBackgroundImagePath.returns(mockBgImagePath)
      ninoxClientStub.downloadDatabaseBackgroundImage.resolves()

      await databaseService.download()

      sinon.assert.calledOnceWithExactly(ninoxClientStub.getDatabase, databaseId)
      sinon.assert.calledOnceWithExactly(
        ninoxProjectServiceStub.parseDatabaseConfigs,
        {id: databaseId, settings: databaseJSONMock.settings},
        databaseJSONMock.schema,
        [],
        [],
      )
      sinon.assert.calledOnceWithExactly(
        ninoxProjectServiceStub.writeDatabaseToFiles,
        databaseInfoMock,
        schemaMock,
        tablesMock,
        [],
        [],
      )
      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.createDatabaseFolderInFiles)
      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.getDbBackgroundImagePath)
      sinon.assert.calledOnceWithExactly(ninoxClientStub.downloadDatabaseBackgroundImage, databaseId, mockBgImagePath)
    })
  })

  describe('listDatabases', () => {
    it('should call ninoxClient.listDatabases', async () => {
      ninoxClientStub.listDatabases.resolves([{id: databaseId, name: 'Database'}]) // mock response
      const result = await databaseService.list()
      expect(ninoxClientStub.listDatabases.calledOnce).to.be.true
      expect(result).to.eql([{id: databaseId, name: 'Database'}])
    })
  })

  describe('uploadDatabase', () => {
    it('should upload the database and update settings if background image is uploaded', async () => {
      const database = databaseJSONMock
      const {schema, settings} = database
      const databaseForUpload = {id: databaseId, ...database, settings: {...settings}}
      const views: ViewType[] = []
      const reports: Report[] = []

      ninoxClientStub.uploadDatabaseBackgroundImage.resolves(true) // mock that image is uploaded
      ninoxClientStub.updateDatabaseSettingsInNinox.resolves()
      ninoxClientStub.patchDatabaseSchemaInNinox.resolves()

      await databaseService.uploadDatabase(databaseForUpload, schema, views, reports)

      expect(ninoxClientStub.uploadDatabaseBackgroundImage.calledOnceWith(databaseId)).to.be.true
      expect(databaseForUpload.settings.bgType).to.equal('image')
      expect(databaseForUpload.settings.backgroundClass).to.equal('background-file')
      expect(ninoxClientStub.updateDatabaseSettingsInNinox.calledOnceWith(databaseId, databaseForUpload.settings)).to.be
        .true
      expect(ninoxClientStub.patchDatabaseSchemaInNinox.calledOnceWith(databaseId, schema)).to.be.true
    })
  })
})
