import {container} from 'tsyringe'

import {FsUtil} from './fs.utils.js'

const fsUtil = container.resolve<FsUtil>(FsUtil)

export const ensureRootDirectoryStructure = async (paths: string[], recursive: boolean = true): Promise<void> => {
  const pathPromises = paths.map((path) => fsUtil.mkdir(path, {recursive}))
  await Promise.all(pathPromises)
}
