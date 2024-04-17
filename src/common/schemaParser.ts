
import Ajv from "ajv";
import { databaseSchemaSchema } from "./schemas";
 
 // To handle recursive schema, you would typically set it up in your AJV instance like this:
  const ajv = new Ajv({ allowUnionTypes: true });
  ajv.addSchema(databaseSchemaSchema, 'DatabaseSchema');
  databaseSchemaSchema.properties.externalSchemas.additionalProperties = { $ref: 'DatabaseSchema' };
  