import {
  Database,
  DatabaseSchema,
  Table,
  TableLocal,
  DatabaseSchemaLocal,
  DatabaseType,
  DatabaseSchemaLocalType,
  TableLocalType,
} from "../common/schemas";
import {
  createDatabaseFolderInObjects,
  ensureRootDirectoryStructure,
  getObjectFileName,
  getObjectPath,
  writeFile,
} from "../util/fs.util";
import { createYamlDocument } from "../util/yaml.util";
import {
  NinoxCredentials,
  ImportCommandOptions,
  Credentials,
} from "../common/typings";
import { getDatabase } from "../util/ninox.client";

export const run = async (opts: ImportCommandOptions, creds: Credentials) => {
  const { domain, apiKey, workspaceId } = opts;

  // make a request to the Ninox API to get the database
  const dbData = await getDatabase(opts.id, creds, opts.protocol);

  const { schema: schemaData, ...dbRemainingData } = dbData;

  const { database, tables, schema } = ParseData(
    { ...dbRemainingData, id: opts.id },
    schemaData
  );
  await writeToFiles(database, schema, tables);
};

function ParseData(db: any, sc: any) {
  const parsedDatabase = Database.safeParse(db);
  const tables: TableLocalType[] = [];
  const parsedSchema = DatabaseSchema.safeParse(sc);

  if (!parsedDatabase.success || !parsedSchema.success)
    throw new Error("Validation errors: Database or Schema validation failed");

  for (const key in parsedSchema.data.types) {
    const parsedTable = Table.safeParse({
      ...parsedSchema.data.types[key],
      _id: key,
    });
    if (!parsedTable.success)
      throw new Error("Validation errors: Table validation failed");
    tables.push(
      TableLocal.parse({
        table: { ...parsedTable.data, _database: parsedDatabase.data.id },
      })
    );
  }

  const database = parsedDatabase.data;
  const schema = DatabaseSchemaLocal.parse({
    schema: { ...parsedSchema.data, _database: parsedDatabase.data.id },
  });
  return { database, tables, schema };
}

// Write the database, schema and tables to their respective files
async function writeToFiles(
  database: DatabaseType,
  schema: DatabaseSchemaLocalType,
  tables: TableLocalType[]
) {
  await ensureRootDirectoryStructure();
  // Create a subfolder in the root directory/Objects with name Database_${id}
  await createDatabaseFolderInObjects(database.id);
  await writeFile(
    getObjectPath(
      database.id,
      getObjectFileName("Database", database.settings.name)
    ),
    createYamlDocument({ database: database }).toString()
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

  // schema
  await writeFile(
    getObjectPath(
      database.id,
      getObjectFileName("Schema", database.settings.name)
    ),
    createYamlDocument(schema).toString()
  );
}
