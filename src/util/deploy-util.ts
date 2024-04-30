import {
  Database,
  DatabaseConfigFileContent,
  DatabaseFile,
  DatabaseFileType,
  DatabaseSchemaType,
  TableBase,
  TableFile,
  TableFileType,
} from "../common/schemas";
import { DBConfigsYaml } from "../common/typings";
import { parseYamlDocument } from "./yaml-util";

export const parseDatabaseAndSchemaFromFileContent = (
  dbConfig: DatabaseConfigFileContent
) => {
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
        "Table validation failed for table with id: " + tableFileData.table._id
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
};

export const parseDatabaseConfigFileContentFromYaml = (
  dbConfigYaml: DBConfigsYaml
) => {
  const { database: databaseYaml, tables: tablesYaml } = dbConfigYaml;
  return {
    database: parseYamlDocument(databaseYaml) as DatabaseFileType,
    tables: tablesYaml.map(
      (table) => parseYamlDocument(table) as TableFileType
    ),
  } satisfies DatabaseConfigFileContent;
};
