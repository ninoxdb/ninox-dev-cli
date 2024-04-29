import {
  Database,
  DatabaseFile,
  DatabaseFileType,
  DatabaseSchemaType,
  TableBase,
  TableFile,
  TableFileType,
} from "../common/schemas";
import { readDefinedDatabaseConfigsFromFiles } from "../util/fs-util";
import { parseYamlDocument } from "../util/yaml-util";
import {
  DeployCommandOptions,
  Credentials,
} from "../common/typings";
import {
  updateDatabaseSettings,
  uploadDatabaseBackgroundImage,
  uploadDatabaseSchemaToNinox,
} from "../util/ninox-client";

export const run = async (opts: DeployCommandOptions, creds: Credentials) => {
  const dbConfigsInYaml = await readDefinedDatabaseConfigsFromFiles();
  const dbConfigs = dbConfigsInYaml
    .map((dbConfigYaml) => {
      const {
        database: databaseYaml,
        // schema: schemaYaml,
        tables: tablesYaml,
      } = dbConfigYaml;
      return {
        database: parseYamlDocument(databaseYaml) as DatabaseFileType,
        // schema: parseYamlDocument(schemaYaml).schema,
        tables: tablesYaml.map(
          (table) => parseYamlDocument(table) as TableFileType
        ),
      };
    })

    .filter((dbConfig) => {
      return dbConfig.database.database?.id === opts.id;
    })

    .map((dbConfig) => {
      const databaseParseResult = DatabaseFile.safeParse(dbConfig.database);
      if (!databaseParseResult.success) {
        throw new Error(
          `Database validation failed for database: ${dbConfig.database?.database?.settings?.name} (${dbConfig.database.database.id})`
        );
      }
      const schema: DatabaseSchemaType = {
        ...databaseParseResult.data.database.schema,
        types: {},
      };
      for (const tableFileData of dbConfig.tables) {
        const tableResult = TableFile.safeParse(tableFileData);
        if (!tableResult.success) {
          throw new Error(
            "Table validation failed for table with id: " +
              tableFileData.table._id
          );
        }
        schema.types[tableResult.data.table._id] = TableBase.parse(
          tableResult.data.table
        );
      }
      return {
        database: Database.parse(databaseParseResult.data.database),
        schema,
      };
    });

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
