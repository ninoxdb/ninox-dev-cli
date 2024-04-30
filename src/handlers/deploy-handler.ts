import { readDefinedDatabaseConfigsFromFiles } from "../util/fs-util";
import { DeployCommandOptions, Credentials } from "../common/typings";
import {
  updateDatabaseSettings,
  uploadDatabaseBackgroundImage,
  uploadDatabaseSchemaToNinox,
} from "../util/ninox-client";
import {
  parseDatabaseAndSchemaFromFileContent,
  parseDatabaseConfigFileContentFromYaml,
} from "../util/deploy-util";

export const run = async (opts: DeployCommandOptions, creds: Credentials) => {
  const dbConfigsInYaml = await readDefinedDatabaseConfigsFromFiles();
  const dbConfigs = dbConfigsInYaml
    .map(parseDatabaseConfigFileContentFromYaml)

    .filter((dbConfig) => {
      return dbConfig.database.database?.id === opts.id;
    })

    .map(parseDatabaseAndSchemaFromFileContent);

  for (const { database, schema } of dbConfigs) {
    // upload DB background
    const isUploaded = await uploadDatabaseBackgroundImage(database.id, creds);
    if (isUploaded) {
      database.settings.bgType = "image";
      database.settings.backgroundClass = "background-file";
    }
    await updateDatabaseSettings(database.id, database.settings, creds);
    // upload database schema
    await uploadDatabaseSchemaToNinox(database.id, schema, creds);
  }
};
