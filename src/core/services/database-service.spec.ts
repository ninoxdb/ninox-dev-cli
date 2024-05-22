import {expect} from 'chai'
import sinon from 'sinon'

import {GetDatabaseResponse} from '../common/schema-validators.js'
import {NinoxClient} from '../utils/ninox-client.js'
import {DatabaseService} from './database-service.js'

describe('DatabaseService', () => {
  let ninoxClientStub: sinon.SinonStubbedInstance<NinoxClient>
  let databaseService: DatabaseService
  const databaseId = '1234'
  const databaseJSONMock: GetDatabaseResponse = {
    schema: {
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
    },
    settings: {
      color: 'color',
      icon: 'icon',
      name: 'Database',
    },
  }

  beforeEach(() => {
    ninoxClientStub = sinon.createStubInstance(NinoxClient)
    databaseService = new DatabaseService(ninoxClientStub, 'workspaceId', databaseId)
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('downloadDatabaseBackgroundImage', () => {
    it('should call ninoxClient.downloadDatabaseBackgroundImage with correct parameters', async () => {
      await databaseService.downloadDatabaseBackgroundImage(databaseId, 'imagePath')
      expect(ninoxClientStub.downloadDatabaseBackgroundImage.calledOnceWith(databaseId, 'imagePath')).to.be.true
    })
  })

  describe('getDatabase', () => {
    it('should call ninoxClient.getDatabase with correct id', async () => {
      ninoxClientStub.getDatabase.resolves(databaseJSONMock) // mock response
      const result = await databaseService.getDatabase(databaseId)
      expect(ninoxClientStub.getDatabase.calledOnceWith(databaseId)).to.be.true
      expect(result).to.eql(databaseJSONMock)
    })
  })

  describe('listDatabases', () => {
    it('should call ninoxClient.listDatabases', async () => {
      ninoxClientStub.listDatabases.resolves([{id: databaseId, name: 'Database'}]) // mock response
      const result = await databaseService.listDatabases()
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
