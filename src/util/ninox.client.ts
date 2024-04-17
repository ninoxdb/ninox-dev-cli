import axios from "axios";
import { Credentials } from "../common/typings";

export const getDatabase = async (creds: Credentials, opts: { id: string }) => {
  const response = await axios.get(
    `https://${creds.domain}/v1/teams/${creds.workspaceId}/databases/${opts.id}`,
    {
      headers: {
        Authorization: `Bearer ${creds.apiKey}`,
      },
    }
  );
  return response.data;
};

export const updateDatabaseSettings = async (
  creds: Credentials,
  opts: { id: string; settings: any }
) => {
  try {
    const data = JSON.stringify(opts.settings);
    const response = await axios.post(
      `https://${creds.domain}/${creds.workspaceId}/${opts.id}/settings/update`,
      data,
      {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
          "Content-Type": "text/plain",
        },
      }
    );
    return response.data;
  } catch (e: any) {
    console.log("Error in request", e.message);
  }
};

export const uploadDatabaseSchemaToNinox = async (
  creds: Credentials,
  opts: { id: string; schema: any }
) => {
  try {
    delete opts.schema.id;
    const response = await axios.patch(
      `https://${creds.domain}/v1/teams/${creds.workspaceId}/databases/${opts.id}/schema`,
      opts.schema,
      {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
          // "Content-Type": "text/plain",
        },
      }
    );
    return response.data;
  } catch (e: any) {
    console.log("Error in request", e.message);
  }
};
