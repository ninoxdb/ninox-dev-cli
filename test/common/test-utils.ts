import {createRequire} from 'node:module'
import path from 'node:path'
import url from 'node:url'
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
