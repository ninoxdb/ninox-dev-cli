import axios, {AxiosError} from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

import {DB_BACKGROUND_FILE_NAME} from '../common/constants.js'
import {DatabaseMetadata, DatabaseSchemaType, DatabaseSettingsType, DatabaseType} from '../common/schemas.js'
import {ImportCommandOptions, NinoxCredentials} from '../common/typings.js'
import {FSUtil} from './fs-util.js'

export class NinoxClient {
  // download the background image from /{accountId}/root/background.jpg
  public static downloadDatabaseBackgroundImage = async (opts: ImportCommandOptions, creds: NinoxCredentials) => {
    try {
      const imagePath = FSUtil.getDbBackgroundImagePath(opts.id)
      const imageUrl = `${creds.domain}/${creds.workspaceId}/${opts.id}/files/${DB_BACKGROUND_FILE_NAME}`
      await this.downloadImage(imageUrl, imagePath, creds.apiKey)
    } catch {}
  }

  public static getDatabase = async (id: string, creds: NinoxCredentials) =>
    axios
      .get(`${creds.domain}/v1/teams/${creds.workspaceId}/databases/${id}?human=T`, {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
        },
      })
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to fetch database'))

  public static listDatabases = async (creds: NinoxCredentials) =>
    axios
      .get(`${creds.domain}/v1/teams/${creds.workspaceId}/databases`, {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
        },
      })
      .then((response) => response.data as DatabaseMetadata[])
      .catch((error) => handleAxiosError(error, 'Failed to list databases'))

  public static updateDatabaseSettings = async (
    id: string,
    settings: DatabaseSettingsType,
    creds: NinoxCredentials,
  ) => {
    const data = JSON.stringify(settings)
    return axios
      .post(`${creds.domain}/${creds.workspaceId}/${id}/settings/update`, data, {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
          'Content-Type': 'text/plain',
        },
      })
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to Update Database settings.'))
  }

  public static uploadDatabase = async (
    database: DatabaseType,
    schema: DatabaseSchemaType,
    creds: NinoxCredentials,
  ) => {
    // upload DB background

    const isUploaded = await this.uploadDatabaseBackgroundImage(database.id, creds)
    if (isUploaded) {
      database.settings.bgType = 'image'
      database.settings.backgroundClass = 'background-file'
    }

    await this.updateDatabaseSettings(database.id, database.settings, creds)
    // upload database schema
    await this.uploadDatabaseSchemaToNinox(database.id, schema, creds)
  }

  public static uploadDatabaseBackgroundImage = async (databaseId: string, creds: NinoxCredentials) => {
    if (!FSUtil.isDatabaseBackgroundFileExist(databaseId)) {
      return
    }

    const imagePath = FSUtil.getDbBackgroundImagePath(databaseId)
    const imageUrl = `${creds.domain}/${creds.workspaceId}/${databaseId}/files/${DB_BACKGROUND_FILE_NAME}`

    await this.uploadImage(imageUrl, imagePath, creds.apiKey)
    return true
  }

  public static uploadDatabaseSchemaToNinox = async (id: string, schema: DatabaseSchemaType, creds: NinoxCredentials) =>
    axios
      .patch(`${creds.domain}/v1/teams/${creds.workspaceId}/databases/${id}/schema?human=T`, schema, {
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
        },
      })
      .then((response) => response.data)
      .catch((error) =>
        handleAxiosError(
          error,
          'Failed to Update Schema. Please consider updating your local version of the schema by importing the latest version from the target account.',
        ),
      )

  private static async downloadImage(url: string, path: string, apiKey: string) {
    try {
      // Axios GET request to fetch the image as a stream
      const response = await axios({
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        method: 'GET',
        responseType: 'stream',
        url,
      })

      // Create a write stream to save the file
      const writer = fs.createWriteStream(path)

      // Pipe the response data to the file
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
    } catch {}
  }

  private static async uploadImage(url: string, path: string, apiKey: string) {
    // Create a new instance of FormData
    const formData = new FormData()

    // Append the file to the form data. The 'file' is the key by which the server expects the file binary.
    formData.append('file', fs.createReadStream(path))

    // Perform the PUT request with the form data
    return axios.post(url, formData, {
      headers: {
        // FormData will generate the correct Content-Type boundary itself
        ...formData.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
      },
    })
  }
}

function handleAxiosError(error: unknown, msg: string) {
  if (error instanceof AxiosError) {
    let {message, response} = error
    const data = response?.data
    message = `${msg}\n${data?.message ?? data ?? message}`
    throw new Error(message)
  }

  throw error
}
