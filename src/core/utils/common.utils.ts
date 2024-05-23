import {FsUtil} from '@src/core/utils/fs.utils.js'
import {container} from 'tsyringe'

const fsUtil = container.resolve<FsUtil>(FsUtil)

export const ensureRootDirectoryStructure = async (paths: string[], recursive: boolean = true): Promise<void> => {
  const pathPromises = paths.map((path) => fsUtil.mkdir(path, {recursive}))
  await Promise.all(pathPromises)
}
