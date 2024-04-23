import {
  Database,
  DatabaseSchemaBase,
  DatabaseSchemaType,
  Table,
  TableBase,
} from "../common/schemas";
import { readDefinedDatabaseConfigsFromFiles } from "../util/fs.util";
import { parseYamlDocument } from "../util/yaml.util";
import { NinoxCredentials, DeployCommandOptions } from "../common/typings";
import {
  updateDatabaseSettings,
  uploadDatabaseSchemaToNinox,
} from "../util/ninox.client";

export const run = async (opts: DeployCommandOptions) => {
  const dbConfigsInYaml = await readDefinedDatabaseConfigsFromFiles();
  const dbConfigs = dbConfigsInYaml
    .map((dbConfigYaml) => {
      const {
        database: databaseYaml,
        schema: schemaYaml,
        tables: tablesYaml,
      } = dbConfigYaml;
      return {
        database: parseYamlDocument(databaseYaml).database,
        schema: parseYamlDocument(schemaYaml).schema,
        tables: tablesYaml.map((table) => parseYamlDocument(table).table),
      };
    })

    .filter((dbConfig) => {
      return dbConfig.database.id === opts.id;
    })

    .map((dbConfig) => {
      const databaseParseResult = Database.safeParse(dbConfig.database);
      if (!databaseParseResult.success) {
        throw new Error(
          "Database validation failed for database with id: " +
            dbConfig.database.id
        );
      }
      const schemaResult = DatabaseSchemaBase.safeParse(dbConfig.schema);
      if (!schemaResult.success) {
        throw new Error(
          "Schema validation failed for database with id: " +
            dbConfig.database.id
        );
      }
      const schema: DatabaseSchemaType = { ...schemaResult.data, types: {} };
      for (const tableData of dbConfig.tables) {
        const tableResult = Table.safeParse(tableData);
        if (!tableResult.success) {
          throw new Error(
            "Table validation failed for table with id: " + tableData._id
          );
        }
        schema.types[tableResult.data._id] = TableBase.parse(tableResult.data);
      }

      return {
        database: databaseParseResult.data,
        schema: schema,
      };
    });

  for (const { database, schema } of dbConfigs) {
    const { domain, apiKey, workspaceId } = opts;
    const creds: NinoxCredentials = {
      apiKey,
      domain,
      workspaceId,
    };
    await updateDatabaseSettings(
      database.id,
      database.settings,
      creds,
      opts.protocol
    );

    // upload database schema
    await uploadDatabaseSchemaToNinox(
      database.id,
      schema,
      creds,
      opts.protocol
    );
  }
};
