import axios, { AxiosError } from "axios";
import { DatabaseSettings, NinoxCredentials } from "../common/typings";
import { DatabaseSchemaType } from "../common/schemas";

export const getDatabase = async (
  id: string,
  creds: NinoxCredentials,
  protocol: "http" | "https" = "https"
) => {
  try {
    const response = await axios.get(
      `${protocol}://${creds.domain}/v1/teams/${creds.workspaceId}/databases/${id}?human=T`,
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
  creds: NinoxCredentials,
  protocol: "http" | "https" = "https"
) => {
  try {
    const data = JSON.stringify(settings);
    const response = await axios.post(
      `${protocol}://${creds.domain}/${creds.workspaceId}/${id}/settings/update`,
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
  creds: NinoxCredentials,
  protocol: "http" | "https" = "https"
) => {
  try {
    const response = await axios.patch(
      `${protocol}://${creds.domain}/v1/teams/${creds.workspaceId}/databases/${id}/schema?human=T`,
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
