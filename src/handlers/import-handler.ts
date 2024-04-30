import { ImportCommandOptions, Credentials } from "../common/typings";
import {
  downloadDatabaseBackgroundImage,
  getDatabase,
} from "../util/ninox-client";
import { ParseData, writeToFiles } from "../util/import-util";
import { createDatabaseFolderInFiles } from "../util/fs-util";

export const run = async (opts: ImportCommandOptions, creds: Credentials) => {
  // make a request to the Ninox API to get the database
  const dbData = await getDatabase(opts.id, creds);

  const { schema: schemaData, ...dbRemainingData } = dbData;

  const { database, tables, schema } = ParseData(
    { ...dbRemainingData, id: opts.id },
    schemaData
  );
  await writeToFiles(database, schema, tables);
  await createDatabaseFolderInFiles(opts.id);
  // download the background image from /{accountId}/root/background.jpg
  await downloadDatabaseBackgroundImage(opts, creds);
};
