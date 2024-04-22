import {
  DatabaseSchema,
  TableSchema,
  DatabaseSchemaSchema,
  Schema,
  Table,
} from "../common/schemas";
import {
  createDatabaseFolderInObjects,
  ensureRootDirectoryStructure,
  getObjectFileName,
  getObjectPath,
  writeFile,
} from "../util/fs.util";
import { createYamlDocument } from "../util/yaml.util";
import { Database } from "../common/typings";
import { NinoxCredentials, ImportCommandOptions } from "../common/typings";
import { getDatabase } from "../util/ninox.client";

export const run = async (opts: ImportCommandOptions) => {
  const { domain, apiKey, workspaceId } = opts;
  const creds: NinoxCredentials = {
    apiKey,
    domain,
    workspaceId,
  };

  // make a request to the Ninox API to get the database
  const dbData = await getDatabase(creds, { id: opts.id }, opts.protocol);

  const { schema: schemaData, ...dbRemainingData } = dbData;

  const { database, tables, schema } = ParseData(
    { ...dbRemainingData, id: opts.id },
    schemaData
  );
  await writeToFiles(database, schema, tables);
};

function ParseData(db: any, sc: any) {
  const parsedDatabase = DatabaseSchema.safeParse(db);
  const tables: Table[] = [];
  let parsedTableSuccess = true;
  for (const key in sc.types) {
    const parsedTable = TableSchema.safeParse({ ...sc.types[key], id: key });
    if (parsedTable.success) tables.push(parsedTable.data);
    else parsedTableSuccess = false;
  }

  const parsedSchema = DatabaseSchemaSchema.safeParse(sc);

  if (!parsedDatabase.success || !parsedTableSuccess || !parsedSchema.success) {
    throw new Error("Validation errors:");
  }
  const database = parsedDatabase.data;
  const schema = parsedSchema.data;
  return { database, tables, schema };
}

// Write the database, schema and tables to their respective files
async function writeToFiles(
  database: Database,
  schema: Schema,
  table: Table[]
) {
  await ensureRootDirectoryStructure();
  // Create a subfolder in the root directory/Objects with name Database_${id}
  await createDatabaseFolderInObjects(database.id);
  await writeFile(
    getObjectPath(
      database.id,
      getObjectFileName("Database", database.settings.name)
    ),
    createYamlDocument({ database }).toString()
  );
  // table
  for (const t of table) {
    await writeFile(
      getObjectPath(
        database.id,
        getObjectFileName("Table", t.caption as string)
      ),
      createYamlDocument({
        table: { database: database.id, ...t },
      }).toString()
    );
  }

  // schema
  await writeFile(
    getObjectPath(
      database.id,
      getObjectFileName("Schema", database.settings.name)
    ),
    createYamlDocument({
      schema: { database: database.id, ...schema },
    }).toString()
  );
}
