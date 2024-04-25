import { InitCommandOptions } from "../common/typings";
import {
  ensureRootDirectoryStructure,
  createDatabaseFolderInObjects,
  createDatabaseFolderInFiles,
  createPackageJson,
  createConfigYaml,
} from "../util/fs.util";

export const run = async (opts: InitCommandOptions) => {
  await createPackageJson(opts.name, opts.description);
  await createConfigYaml();
  await ensureRootDirectoryStructure();
  if (opts.id) {
    await createDatabaseFolderInObjects(opts.id);
    await createDatabaseFolderInFiles(opts.id);
  }
  console.log("Success: Project Initialized");
};
