import Ajv from "ajv";
import { DatabaseSchema } from "../schemas";

export const parse = (data: any) => {
  const ajv = new Ajv();
  const validateDatabase = ajv.compile(DatabaseSchema);

  if (validateDatabase(data)) {
    console.log("Validation successful:", data);
  } else {
    console.log("Validation errors:", validateDatabase.errors);
  }
};
