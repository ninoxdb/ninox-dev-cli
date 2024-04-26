import axios, { AxiosError } from "axios";
import {
  DatabaseSettings,
  ImportCommandOptions,
  NinoxCredentials,
} from "../common/typings";
import { DatabaseSchemaType } from "../common/schemas";
import {
  getDbBackgroundImagePath,
  isDatabaseBackgroundFileExist,
} from "./fs.util";
const stream = require("stream");
const { promisify } = require("util");
const pipeline = promisify(stream.pipeline);
import fs from "fs";
import { DB_BACKGROUND_FILE_NAME } from "../common/constants";
const FormData = require("form-data");

export const getDatabase = async (id: string, creds: NinoxCredentials) => {
  try {
    const response = await axios.get(
      `${creds.domain}/v1/teams/${creds.workspaceId}/databases/${id}?human=T`,
      {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
        },
      }
    );
    return response.data;
  } catch (e) {
    if (e instanceof Error) {
      console.log("Error in request", e.message);
    }
    throw e;
  }
};

export const updateDatabaseSettings = async (
  id: string,
  settings: DatabaseSettings,
  creds: NinoxCredentials
) => {
  try {
    const data = JSON.stringify(settings);
    const response = await axios.post(
      `${creds.domain}/${creds.workspaceId}/${id}/settings/update`,
      data,
      {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
          "Content-Type": "text/plain",
        },
      }
    );
    return response.data;
  } catch (e) {
    if (e instanceof Error) {
      console.log("Error in request", e.message);
    }
    throw e;
  }
};

export const uploadDatabaseSchemaToNinox = async (
  id: string,
  schema: DatabaseSchemaType,
  creds: NinoxCredentials
) => {
  try {
    const response = await axios.patch(
      `${creds.domain}/v1/teams/${creds.workspaceId}/databases/${id}/schema?human=T`,
      schema,
      {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
        },
      }
    );
    return response.data;
  } catch (e) {
    if (e instanceof Error) {
      console.log(
        "Failed to Update Schema. Please consider updating your local version of the schema by importing the latest version from the target account.",
        e.message
      );
    }
    if (e instanceof AxiosError) {
      console.log("Response: ", e.response?.data);
    }
    throw e;
  }
};

export const downloadDatabaseBackgroundImage = async (
  opts: ImportCommandOptions,
  creds: NinoxCredentials
) => {
  try {
    //
    const imagePath = getDbBackgroundImagePath(opts.id);
    const imageUrl = `${creds.domain}/${creds.workspaceId}/${opts.id}/files/${DB_BACKGROUND_FILE_NAME}`;

    await downloadImage(imageUrl, imagePath, creds.apiKey);
    // const response = await axios(
    //   imageUrl,
    //   {
    //     method: "GET",
    //     responseType: "arraybuffer",
    //     headers: {
    //       Authorization: `Bearer ${creds.apiKey}`,
    //     },
    //   }
    // );
    // // Creating a write stream to the specified file path
    // const writer = fs.createWriteStream(imagePath);

    // // Streaming the data into the file
    // await pipeline(response.data, writer);

    console.log(`Image has been downloaded and saved to ${imagePath}`);
  } catch (e) {
    // console.log("Error");
  }
};

// try # 2
async function downloadImage(url: string, path: string, apiKey: string) {
  try {
    // Axios GET request to fetch the image as a stream
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Create a write stream to save the file
    const writer = fs.createWriteStream(path);

    // Pipe the response data to the file
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    // console.error("Error downloading the image:", error);
  }
}

// Upload: https://saqib2.ninoxdb.de/qnbfhl32kbi45d5ii/ist4yzlpvs6x/files/background.jpg
export const uploadDatabaseBackgroundImage = async (
  databaseId: string,
  creds: NinoxCredentials
) => {
  if (!isDatabaseBackgroundFileExist(databaseId)) {
    return;
  }
  const imagePath = getDbBackgroundImagePath(databaseId);
  const imageUrl = `${creds.domain}/${creds.workspaceId}/${databaseId}/files/${DB_BACKGROUND_FILE_NAME}`;

  await uploadImage(imageUrl, imagePath, creds.apiKey);
  return true;
};

async function uploadImage(url: string, path: string, apiKey: string) {
  // Create a new instance of FormData
  const formData = new FormData();

  // Append the file to the form data. The 'file' is the key by which the server expects the file binary.
  formData.append("file", fs.createReadStream(path));

  // Perform the PUT request with the form data
  const response = await axios.post(url, formData, {
    headers: {
      // FormData will generate the correct Content-Type boundary itself
      ...formData.getHeaders(),
      Authorization: `Bearer ${apiKey}`,
    },
  });

  // console.log("File uploaded successfully:", response.data);
}
