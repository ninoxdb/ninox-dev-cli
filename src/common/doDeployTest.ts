import { z } from "zod";
import {
  DatabaseSchema,
  TableSchema,
  DatabaseSchemaSchema,
  Schema,
  Table,
  DatabaseSchemaForUpload,
  TableSchemaForUpload,
} from "./schemas";
import {
  createDatabaseFolderInObjects,
  ensureRootDirectoryStructure,
  getObjectFileName,
  getObjectPath,
  readDefinedDatabaseConfigs,
  writeFile,
} from "../util/fs.util";
import { createYamlDocument, parseYamlDocument } from "../util/yaml.util";
import { Database } from "./typings";
import { Credentials } from "./typings";
import { Options } from "../commands/object-import";
import axios from "axios";
import {
  updateDatabaseSettings,
  uploadDatabaseSchemaToNinox,
} from "../util/ninox.client";

export const run = async (opts: Options) => {
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
  //   console.log("dbConfigs", dbConfigs);

  for (const dbConfig of dbConfigs) {
    const { domain, apiKey, workspaceId } = opts;
    const creds: Credentials = {
      apiKey,
      domain,
      workspaceId,
    };
    await updateDatabaseSettings(creds, {
      id: dbConfig.database.id,
      settings: dbConfig.database.settings,
    });

    // upload database schema
    await uploadDatabaseSchemaToNinox(creds, {
      id: dbConfig.database.id,
      schema: {
        ...dbConfig.schema,
        types: dbConfig.tables.reduce((acc, table) => {
          return { ...acc, [table.id as string]: table };
        }, {}),
      },
    });
  }
};
