import Ajv from "ajv";
import { databaseSchema } from "./schemas";
const ajv = new Ajv();

const validateDatabase = ajv.compile(databaseSchema);
const dbData = JSON.parse(`{"id":"ut0i1nutbi9t","name":"6050","dbname":"6050","settings":{"name":"6050","icon":"database","color":"#9da9ce"},"icon":"database"}`);

if (validateDatabase(dbData)) {
  console.log("Validation successful:", dbData);
} else {
  console.log("Validation errors:", validateDatabase.errors);
}
