import * as fsAsync from "fs/promises";
import fs from "fs";
import path from "path";
import { InitCommandOptions, DBConfigsRaw, Database } from "../common/typings";
import { Schema, Table } from "../common/schemas";

const ObjectsPath = path.join(process.cwd(), "src", "Objects");
const FilesPath = path.join(process.cwd(), "src", "Files");

export const ensureRootDirectoryStructure = async () => {
  await fsAsync.mkdir(ObjectsPath, { recursive: true });
  await fsAsync.mkdir(FilesPath, { recursive: true });
};

export const createDatabaseFolderInObjects = async (databaseId: string) => {
  // create folder src/Object/Database_${databaseid}
  await fsAsync.mkdir(path.join(ObjectsPath, `Database_${databaseId}`), {
    recursive: true,
  });
};

export const createDatabaseFolderInFiles = async (databaseId: string) => {
  // create folder src/Files/Database_${databaseid}
  await fsAsync.mkdir(path.join(FilesPath, `Database_${databaseId}`), {
    recursive: true,
  });
};

export const getObjectPath = (databaseId: string, objectName: string) => {
  if (!fs.existsSync(path.join(ObjectsPath, `Database_${databaseId}`))) {
    throw new Error("Object path not set");
  }
  return path.join(ObjectsPath, `Database_${databaseId}`, `${objectName}.yaml`);
};

export const getFilePath = (databaseId: string, objectName: string) => {
  if (!fs.existsSync(path.join(FilesPath, `Database_${databaseId}`))) {
    throw new Error("File path not set");
  }
  return path.join(FilesPath, `Database_${databaseId}`, `${objectName}.yaml`);
};

export const writeFile = async (path: string, data: string) => {
  await fsAsync.writeFile(path, data, "utf-8");
};

export const getObjectFileName = (objectType: string, objectId: string) => {
  return `${objectType}_${normalizeFileName(objectId)}`;
};

export const readDefinedDatabaseConfigs = async () => {
  // do a scan of ObjectsPath dir
  // read all the directories
  // each directory is a isolated database with its own schema, tables and views

  // return an array of database configs
  const databaseConfigs: DBConfigsRaw[] = [];
  if (!fs.existsSync(ObjectsPath)) {
    return databaseConfigs;
  }
  const databaseFolders = await fsAsync.readdir(ObjectsPath);
  for (const folder of databaseFolders) {
    const databaseId = folder.split("_")[1];
    const files = await fsAsync.readdir(path.join(ObjectsPath, folder));
    const databaseFile = files.find((file) => file.startsWith("Database_"));
    if (!databaseFile) {
      throw new Error("Database file not found");
    }
    const schemaFile = files.find((file) => file.startsWith("Schema_"));
    // TODO: assume schema is always present
    if (!schemaFile) {
      throw new Error("Schema file not found");
    }
    const database = await fsAsync.readFile(
      path.join(ObjectsPath, folder, databaseFile), //`Database_${databaseId}.yaml`
      "utf-8"
    );
    const schema = await fsAsync.readFile(
      path.join(ObjectsPath, folder, schemaFile), //`Schema_${databaseId}.yaml`
      "utf-8"
    );
    const tableFiles = files.filter((file) => file.startsWith("Table_"));
    const tables = await Promise.all(
      tableFiles.map(async (table) => {
        return await fsAsync.readFile(
          path.join(ObjectsPath, folder, table),
          "utf-8"
        );
      })
    );
    databaseConfigs.push({
      database,
      schema,
      tables: tables,
    });
  }
  return databaseConfigs;
};

function normalizeFileName(name: string) {
  // Replace sequences of non-alphanumeric characters (except underscores) with a single underscore
  return name.replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
}

export const createPackageJson = async (name: string, description?: string) => {
  const packageJson = {
    name: name,
    version: "1.0.0",
    description: description ?? "",
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: [],
  };
  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (fs.existsSync(packageJsonPath)) {
    throw new Error(
      "package.json already exists in the current directory. Please change the directory or remove the existing package.json file"
    );
  }
  await fsAsync.writeFile(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2)
  );
};
