import {createRequire} from 'node:module'
import path from 'node:path'
import url from 'node:url'

import {
  DatabaseSchemaBaseType,
  DatabaseSchemaInFileType,
  DatabaseSchemaType,
  TableBaseType,
  TableFileType,
} from '../../src/core/common/schema-validators.js'
const require = createRequire(import.meta.url)

export const loadJsonMock = (filename: string) =>
  require(path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'mocks', filename))

export const credentialsFilePath = path.join(import.meta.url, '..', '..', 'mocks', 'nx-project', 'config.yaml')

export const filesPath = path.join(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '..',
  'mocks',
  'nx-project',
  'Files',
)

export const objectsPath = path.join(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '..',
  'mocks',
  'nx-project',
  'Objects',
)

export const mockNinoxEnvironment = {
  apiKey: 'mocked-api-key',
  domain: 'https://mocked.example.com',
  workspaceId: 'mocked-workspace',
}

export const testSchemaBase: DatabaseSchemaBaseType = {
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
  seq: 92,
  version: 33,
}

export const testSchemaInFile: DatabaseSchemaInFileType = {
  ...testSchemaBase,
  _database: '4321',
}

export const testSchema: DatabaseSchemaType = {
  ...testSchemaBase,
  types: {},
}

export const testTable: TableBaseType = {
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

export const testTableInFile: TableFileType = {
  table: {
    _database: '4321',
    _id: 'A',
    ...testTable,
  },
}

export const testTablesInFile: TableFileType[] = [testTableInFile]

export const testDatabase = {id: 'db1', settings: {color: 'color1', icon: 'icon1', name: 'TestDB'}}
