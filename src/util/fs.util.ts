import fs from "fs/promises";
import path from "path";

const ObjectsPath = path.join(process.cwd(), "src", "Objects");
const FilesPath = path.join(process.cwd(), "src", "Files");

let finalObjectPath: string;
let finalFilePath: string;

export const ensureRootDirectoryStructure = async () => {
  await fs.mkdir(ObjectsPath, { recursive: true });
  await fs.mkdir(FilesPath, { recursive: true });
};

export const createDatabaseFolderInObjects = async (databaseId: string) => {
  // create folder src/Object/Database_${databaseid}
  finalObjectPath = path.join(ObjectsPath, `Database_${databaseId}`);
  await fs.mkdir(finalObjectPath, { recursive: true });
};

export const createDatabaseFolderInFiles = async (databaseId: string) => {
  // create folder src/Files/Database_${databaseid}
  finalFilePath = path.join(FilesPath, `Database_${databaseId}`);
  await fs.mkdir(finalFilePath, { recursive: true });
};

export const getObjectPath = (databaseId: string, objectName: string) => {
  if (!finalObjectPath) {
    throw new Error("Object path not set");
  }
  return path.join(ObjectsPath, `Database_${databaseId}`, `${objectName}.yaml`);
};

export const getFilePath = (databaseId: string, objectName: string) => {
  if (!finalFilePath) {
    throw new Error("File path not set");
  }
  return path.join(FilesPath, `Database_${databaseId}`, `${objectName}.yaml`);
};

export const writeFile = async (path: string, data: string) => {
  await fs.writeFile(path, data, "utf-8");
};

export const getObjectFileName = (objectType: string, objectId: string) => {
  return `${objectType}_${objectId}`;
};
