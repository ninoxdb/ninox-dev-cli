import axios, { AxiosError } from "axios";
import { Credentials } from "../common/typings";

export const getDatabase = async (
  creds: Credentials,
  opts: { id: string },
  protocol: "http" | "https" = "https"
) => {
  try {
    const response = await axios.get(
      `${protocol}://${creds.domain}/v1/teams/${creds.workspaceId}/databases/${opts.id}?human=T`,
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
  creds: Credentials,
  opts: { id: string; settings: any },
  protocol: "http" | "https" = "https"
) => {
  try {
    const data = JSON.stringify(opts.settings);
    const response = await axios.post(
      `${protocol}://${creds.domain}/${creds.workspaceId}/${opts.id}/settings/update`,
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
  creds: Credentials,
  opts: { id: string; schema: any },
  protocol: "http" | "https" = "https"
) => {
  try {
    delete opts.schema.id;
    const response = await axios.patch(
      `${protocol}://${creds.domain}/v1/teams/${creds.workspaceId}/databases/${opts.id}/schema?human=T`,
      opts.schema,
      {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
        },
      }
    );
    return response.data;
  } catch (e) {
    if (e instanceof Error) {
      console.log("Failed to Update Schema. Please consider updating your local version of the schema by importing the latest version from the target account.", e.message);
    }
    if(e instanceof AxiosError){
      console.log('Response: ',e.response?.data);
    }
    throw e;
  }
};
