import path from 'node:path'
import * as process from 'node:process'

import {CREDENTIALS_FILE_NAME, FILES_PATH, OBJECTS_PATH, SRC_PATH} from '../common/constants.js'

export const PathsUtils = {
  credentialsFilePath: (basePath: string): string => path.join(basePath, CREDENTIALS_FILE_NAME),
  databaseFilesDirectoryPath: (databaseId: string): string => path.join(FILES_PATH, `Database_${databaseId}`),
  filesPath: (basePath: string): string => path.join(basePath, SRC_PATH, FILES_PATH),
  objectsPath: (basePath: string): string => path.join(basePath, SRC_PATH, OBJECTS_PATH),
  packageJsonFilePath: (): string => path.join(process.cwd(), 'package.json'),
}
