import fs from "fs/promises";
import path from "path";

const ObjectsPath = path.join(process.cwd(), "src","Objects");
const FilesPath = path.join(process.cwd(), "src","Files");

export const ensureRootDirectoryStructure = async () => {
    await fs.mkdir(ObjectsPath, { recursive: true });
    await fs.mkdir(FilesPath, { recursive: true });
};


export const createDatabaseFolderInObjects = async (databaseId: string) => {
    // create folder src/Object/Database_${databaseid}
    const databaseFolder = path.join(ObjectsPath,`Database_${databaseId}`);
    await fs.mkdir(databaseFolder, { recursive: true });
}

export const createDatabaseFolderInFiles = async (databaseId: string) => {
    // create folder src/Files/Database_${databaseid}
    const databaseFolder = path.join(FilesPath,`Database_${databaseId}`);
    await fs.mkdir(databaseFolder, { recursive: true });
}

export const getObjectPath = (databaseId: string, objectName: string) => {
    return path.join(ObjectsPath,`Database_${databaseId}`,`${objectName}.yaml`);
}

export const getFilePath = (databaseId: string, objectName: string) => {
    return path.join(FilesPath,`Database_${databaseId}`,`${objectName}.yaml`);
}

export const writeFile = async(path:string, data: string) => {
    await fs.writeFile(path, data, "utf-8");
}

export const getObjectFileName = (objectType: string, objectId: string) => {
    return `${objectType}_${objectId}`;
}