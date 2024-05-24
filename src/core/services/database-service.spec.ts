import {expect} from 'chai'
import 'reflect-metadata'
import sinon from 'sinon'

import {DatabaseSchemaType, GetDatabaseResponse, TableFileType} from '../common/schema-validators.js'
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
    seq: 1,
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
    databaseService = new DatabaseService(ninoxProjectServiceStub, ninoxClientStub, 'workspaceId')
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('upload', () => {
    it('should call the necessary methods to upload data', async () => {
      const mockBgImagePath = 'path/to/bg/image'
      ninoxProjectServiceStub.readDatabaseConfigFromFiles.resolves({
        database: {id: databaseId, settings: settingsMock},
        schema: schemaMock,
      })
      ninoxProjectServiceStub.getDbBackgroundImagePath.returns(mockBgImagePath)
      ninoxProjectServiceStub.isDbBackgroundImageExist.returns(true)
      ninoxClientStub.uploadDatabaseBackgroundImage.resolves()
      ninoxClientStub.updateDatabaseSettings.resolves()
      ninoxClientStub.uploadDatabaseSchemaToNinox.resolves()

      await databaseService.upload(databaseId)

      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.readDatabaseConfigFromFiles, databaseId)
      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.getDbBackgroundImagePath, databaseId)
      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.isDbBackgroundImageExist, databaseId, mockBgImagePath)
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
      ninoxProjectServiceStub.parseDatabaseConfigs.returns({
        database: databaseInfoMock,
        schema: schemaMock,
        tables: tablesMock,
      })
      ninoxProjectServiceStub.writeDatabaseToFiles.resolves()
      ninoxProjectServiceStub.createDatabaseFolderInFiles.resolves()
      ninoxProjectServiceStub.getDbBackgroundImagePath.returns(mockBgImagePath)
      ninoxClientStub.downloadDatabaseBackgroundImage.resolves()

      await databaseService.download(databaseId)

      sinon.assert.calledOnceWithExactly(ninoxClientStub.getDatabase, databaseId)
      sinon.assert.calledOnceWithExactly(
        ninoxProjectServiceStub.parseDatabaseConfigs,
        {id: databaseId, settings: databaseJSONMock.settings},
        databaseJSONMock.schema,
      )
      sinon.assert.calledOnceWithExactly(
        ninoxProjectServiceStub.writeDatabaseToFiles,
        databaseInfoMock,
        schemaMock,
        tablesMock,
      )
      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.createDatabaseFolderInFiles, databaseId)
      sinon.assert.calledOnceWithExactly(ninoxProjectServiceStub.getDbBackgroundImagePath, databaseId)
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

      ninoxClientStub.uploadDatabaseBackgroundImage.resolves(true) // mock that image is uploaded
      ninoxClientStub.updateDatabaseSettings.resolves()
      ninoxClientStub.uploadDatabaseSchemaToNinox.resolves()

      await databaseService.uploadDatabase(databaseForUpload, schema, 'imagePath', true)

      expect(ninoxClientStub.uploadDatabaseBackgroundImage.calledOnceWith(databaseId, 'imagePath', true)).to.be.true
      expect(databaseForUpload.settings.bgType).to.equal('image')
      expect(databaseForUpload.settings.backgroundClass).to.equal('background-file')
      expect(ninoxClientStub.updateDatabaseSettings.calledOnceWith(databaseId, databaseForUpload.settings)).to.be.true
      expect(ninoxClientStub.uploadDatabaseSchemaToNinox.calledOnceWith(databaseId, schema)).to.be.true
    })
  })
})
