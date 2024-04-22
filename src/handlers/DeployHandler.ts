import {
  DatabaseSchema,
  DatabaseSchemaForUpload,
  TableSchemaForUpload,
} from "../common/schemas";
import { readDefinedDatabaseConfigs } from "../util/fs.util";
import { parseYamlDocument } from "../util/yaml.util";
import { NinoxCredentials, DeployCommandOptions } from "../common/typings";
import {
  updateDatabaseSettings,
  uploadDatabaseSchemaToNinox,
} from "../util/ninox.client";

export const run = async (opts: DeployCommandOptions) => {
  const dbConfigsRaw = await readDefinedDatabaseConfigs();
  const dbConfigs = dbConfigsRaw.map((dbConfig) => {
    const {
      database: databaseRaw,
      schema: schemaRaw,
      tables: tablesRaw,
    } = dbConfig;
    const db = parseYamlDocument(databaseRaw);
    const databaseResult = DatabaseSchema.safeParse(db.database);
    if (!databaseResult.success) {
      throw new Error(
        "Database validation failed for database with id: " + db.id
      );
    }
    const schemaData = parseYamlDocument(schemaRaw);
    const schemaResult = DatabaseSchemaForUpload.safeParse(schemaData.schema);
    if (!schemaResult.success) {
      throw new Error(
        "Schema validation failed for database with id: " + db.id
      );
    }
    const tables = tablesRaw.map((table) => {
      const tableData = parseYamlDocument(table);
      const tableResult = TableSchemaForUpload.safeParse(tableData.table);
      if (!tableResult.success) {
        throw new Error(
          "Table validation failed for table with id: " + tableData.id
        );
      }
      return tableResult.data;
    });
    return {
      database: databaseResult.data,
      schema: schemaResult.data,
      tables: tables,
    };
  });

  for (const dbConfig of dbConfigs) {
    const { domain, apiKey, workspaceId } = opts;
    const creds: NinoxCredentials = {
      apiKey,
      domain,
      workspaceId,
    };
    await updateDatabaseSettings(
      creds,
      {
        id: dbConfig.database.id,
        settings: dbConfig.database.settings,
      },
      opts.protocol
    );

    // upload database schema
    await uploadDatabaseSchemaToNinox(
      creds,
      {
        id: dbConfig.database.id,
        schema: {
          ...dbConfig.schema,
          types: dbConfig.tables.reduce((acc, table) => {
            return { ...acc, [table.id as string]: table };
          }, {}),
        },
      },
      opts.protocol
    );
  }
};
