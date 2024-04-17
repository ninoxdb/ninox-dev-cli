
import Ajv from "ajv";
import { TableSchema } from "../schemas";

export const parse = (data: any) => {
  const ajv = new Ajv();
  const validateDatabase = ajv.compile(TableSchema);
  if (validateDatabase(data)) {
    console.log("Validation successful:", data);
  } else {
    console.log("Validation errors:", validateDatabase.errors);
  }
}