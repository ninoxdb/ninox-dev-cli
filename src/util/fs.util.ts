import * as fsAsync from "fs/promises";
import fs from "fs";
import path from "path";
import { DBConfigsRaw, Database } from "../common/typings";
import { Schema, Table } from "../common/schemas";

const ObjectsPath = path.join(process.cwd(), "src", "Objects");
const FilesPath = path.join(process.cwd(), "src", "Files");

// let finalObjectPath: string;
// let finalFilePath: string;

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
  return `${objectType}_${objectId}`;
};

export const readDefinedDatabaseConfigs = async () => {
  // do a scan of ObjectsPath dir
  // read all the directories
  // each directory is a isolated database with its own schema, tables and views

  // return an array of database configs
  const databaseConfigs: DBConfigsRaw[] = [];
  if(!fs.existsSync(ObjectsPath)) {
    return databaseConfigs;
  }
  const databaseFolders = await fsAsync.readdir(ObjectsPath);
  for (const folder of databaseFolders) {
    const databaseId = folder.split("_")[1];
    const database = await fsAsync.readFile(
      path.join(ObjectsPath, folder, `Database_${databaseId}.yaml`),
      "utf-8"
    );
    const schema = await fsAsync.readFile(
      path.join(ObjectsPath, folder, `Schema_${databaseId}.yaml`),
      "utf-8"
    );
    const tableFiles = (
      await fsAsync.readdir(path.join(ObjectsPath, folder))
    ).filter((file) => file.startsWith("Table_"));
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
