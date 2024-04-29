import {
  Database,
  DatabaseSchema,
  TableFile,
  DatabaseType,
  TableFileType,
  DatabaseSchemaBase,
  DatabaseSchemaBaseType,
  TableBase,
  DatabaseFile,
} from "../common/schemas";
import {
  createDatabaseFolderInObjects,
  ensureRootDirectoryStructure,
  getObjectFileName,
  getObjectPath,
  writeFile,
} from "../util/fs-util";
import { createYamlDocument } from "../util/yaml-util";

export function ParseData(db: any, sc: any) {
  const parsedDatabase = Database.safeParse(db);
  const tables: TableFileType[] = [];
  const parsedSchema = DatabaseSchema.safeParse(sc);

  if (!parsedDatabase.success || !parsedSchema.success)
    throw new Error("Validation errors: Database or Schema validation failed");

  for (const key in parsedSchema.data.types) {
    const parsedTable = TableBase.safeParse({
      ...parsedSchema.data.types[key],
    });
    if (!parsedTable.success)
      throw new Error(
        `Validation errors: Table validation failed ${parsedSchema.data.types[key]?.caption}`
      );
    tables.push(
      TableFile.parse({
        table: {
          ...parsedTable.data,
          _id: key,
          _database: parsedDatabase.data.id,
        },
      })
    );
  }

  const database = parsedDatabase.data;
  const schema = DatabaseSchemaBase.parse(parsedSchema.data);
  return { database, tables, schema };
}

// Write the database, schema and tables to their respective files
export async function writeToFiles(
  database: DatabaseType,
  schema: DatabaseSchemaBaseType,
  tables: TableFileType[]
) {
  await ensureRootDirectoryStructure();
  // Create a subfolder in the root directory/Objects with name Database_${id}
  await createDatabaseFolderInObjects(database.id);
  await writeFile(
    getObjectPath(
      database.id,
      getObjectFileName("Database", database.settings.name)
    ),
    createYamlDocument(
      DatabaseFile.parse({
        database: {
          ...database,
          schema: { ...schema, _database: database.id },
        },
      })
    ).toString()
  );
  // table
  for (const table of tables) {
    await writeFile(
      getObjectPath(
        database.id,
        getObjectFileName("Table", table.table.caption as string)
      ),
      createYamlDocument(table).toString()
    );
  }
}
