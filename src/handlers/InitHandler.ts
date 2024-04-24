import { InitCommandOptions } from "../common/typings";
import {
  ensureRootDirectoryStructure,
  createDatabaseFolderInObjects,
  createDatabaseFolderInFiles,
  createPackageJson,
} from "../util/fs.util";

export const run = async (opts: InitCommandOptions) => {
  await createPackageJson(opts.name, opts.description);
  await ensureRootDirectoryStructure();
  if (opts.id) {
    await createDatabaseFolderInObjects(opts.id);
    await createDatabaseFolderInFiles(opts.id);
  }
  console.log("Success: Project Initialized");
};
