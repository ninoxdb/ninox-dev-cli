import Ajv from "ajv";
import { DatabaseSchemaSchema } from "../schemas";

// To handle recursive schema, you would typically set it up in your AJV instance like this:
export const parse = (data: any) => {
  const ajv = new Ajv({ allowUnionTypes: true });
  ajv.addSchema(DatabaseSchemaSchema, "DatabaseSchema");
  DatabaseSchemaSchema.properties.externalSchemas.additionalProperties = {
    $ref: "DatabaseSchemaSchema",
  };
};
