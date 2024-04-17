import { z } from "zod";
import {
  DatabaseSchema,
  TableSchema,
  DatabaseSchemaSchema,
} from "./zodSchemas";
import {
  createDatabaseFolderInObjects,
  ensureRootDirectoryStructure,
  getObjectFileName,
  getObjectPath,
  writeFile,
} from "../util/fs.util";
import { createYamlDocument } from "../util/yaml.util";
import { Database } from "../common/typings";

type Schema = z.infer<typeof DatabaseSchemaSchema>;
type Table = z.infer<typeof TableSchema>;

export const doSOmething = async (opts: any) => {
  const db = {
    id: "ut0i1nutbi9t",
    name: "6050",
    dbname: "6050",
    settings: { name: "6050", icon: "database", color: "#9da9ce" },
    icon: "database",
  };
  const sc = {
    types: {
      A: {
        nextFieldId: 2,
        caption: "Table1",
        captions: {},
        hidden: false,
        fields: {
          A: {
            base: "string",
            caption: "Text",
            captions: {},
            required: false,
            order: 0,
            formWidth: 0.5,
            uuid: "MLrSITSPLyQ6uFH0",
            globalSearch: true,
            hasIndex: false,
            tooltips: {},
            stringAutocorrect: true,
            stringMultiline: false,
            height: 1,
          },
        },
        uis: {},
        afterCreate: "(var x := 1; ((x+( = A));(A := x)))",
        afterUpdate: "(var x := 1; ((x+( = A));(A := x)))",
        uuid: "mAQsbi4gWS3eLKa2",
        globalSearch: true,
        order: 0,
        kind: "table",
      },
    },
    afterOpenBehavior: "restoreNavigation",
    afterOpen: "alert(---Hello World---)",
    hideCalendar: false,
    hideSearch: false,
    hideDatabase: false,
    hideNavigation: false,
  };

  const parsedDatabase = DatabaseSchema.safeParse(db);

  const parsedTable = TableSchema.safeParse({ ...sc.types.A, id: "A" });

  const parsedSchema = DatabaseSchemaSchema.safeParse(sc);

  if (
    !parsedDatabase.success ||
    !parsedTable.success ||
    !parsedSchema.success
  ) {
    console.log("Validation errors:");
    return;
  }
  const database = parsedDatabase.data;
  const table = parsedTable.data;
  const schema = parsedSchema.data;

  await writeToFiles(database, schema, table);

  // Name Database as Database_${id}
  // Name Table as Table_${id}
  // Name Schema as Schema_${id}
  // Write the database, table and schema to their respective files as json
};

async function writeToFiles(database: Database, schema: Schema, table: Table) {
  await ensureRootDirectoryStructure();
  // Create a subfolder in the root directory/Objects with name Database_${id}
  await createDatabaseFolderInObjects(database.id);
  // write the database to a file as json
  await writeFile(
    getObjectPath(database.id, getObjectFileName("Database", database.id)),
    createYamlDocument({ database }).toString()
  );
  // table
  await writeFile(
    getObjectPath(database.id, getObjectFileName("Table", table.id as string)),
    createYamlDocument({
      table: { database: database.id, ...table },
    }).toString()
  );

  // schema
  await writeFile(
    getObjectPath(database.id, getObjectFileName("Schema", database.id)),
    createYamlDocument({
      schema: { database: database.id, ...schema },
    }).toString()
  );
}
