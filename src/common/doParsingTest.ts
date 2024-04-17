import { SafeParseSuccess } from "zod";
import {
  DatabaseSchema,
  TableSchema,
  DatabaseSchemaSchema,
} from "./zodSchemas";

export const doSOmething = (opts: any) => {
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

  const database = DatabaseSchema.safeParse(db);

  const table = TableSchema.safeParse(sc.types.A);

  const schema = DatabaseSchemaSchema.safeParse(sc);

  if (!database.success || !table.success || !schema.success) {
    console.log("Validation errors:");
    return;
  }
  console.log(database.data);
  console.log(table.data);
  console.log(schema.data);
};
