import axios, {AxiosError} from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

import {DB_BACKGROUND_FILE_NAME} from '../common/constants.js'
import {DatabaseMetadata, DatabaseSchemaType, DatabaseSettingsType} from '../common/schemas.js'
import {NinoxCredentials} from '../common/typings.js'
import {FSUtil} from './fs.js'

export class NinoxClient {
  apiKey: string
  domain: string
  workspaceId: string

  constructor(creds: NinoxCredentials) {
    this.apiKey = creds.apiKey
    this.domain = creds.domain
    this.workspaceId = creds.workspaceId
  }

  // download the background image from /{accountId}/root/background.jpg
  // eslint-disable-next-line perfectionist/sort-classes
  public downloadDatabaseBackgroundImage = async (databaseId: string) => {
    try {
      const imagePath = FSUtil.getDbBackgroundImagePath(databaseId)
      const imageUrl = `${this.domain}/${this.workspaceId}/${databaseId}/files/${DB_BACKGROUND_FILE_NAME}`
      await this.downloadImage(imageUrl, imagePath)
    } catch {}
  }

  public getDatabase = async (id: string) =>
    axios
      .get(`${this.domain}/v1/teams/${this.workspaceId}/databases/${id}?human=T`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to fetch database'))

  public listDatabases = async () =>
    axios
      .get(`${this.domain}/v1/teams/${this.workspaceId}/databases`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })
      .then((response) => response.data as DatabaseMetadata[])
      .catch((error) => handleAxiosError(error, 'Failed to list databases'))

  public updateDatabaseSettings = async (id: string, settings: DatabaseSettingsType) => {
    const data = JSON.stringify(settings)
    return axios
      .post(`${this.domain}/${this.workspaceId}/${id}/settings/update`, data, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'text/plain',
        },
      })
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to Update Database settings.'))
  }

  public uploadDatabaseBackgroundImage = async (databaseId: string) => {
    if (!FSUtil.isDatabaseBackgroundFileExist(databaseId)) {
      return
    }

    const imagePath = FSUtil.getDbBackgroundImagePath(databaseId)
    const imageUrl = `${this.domain}/${this.workspaceId}/${databaseId}/files/${DB_BACKGROUND_FILE_NAME}`

    await this.uploadImage(imageUrl, imagePath)
    return true
  }

  public uploadDatabaseSchemaToNinox = async (id: string, schema: DatabaseSchemaType) =>
    axios
      .patch(`${this.domain}/v1/teams/${this.workspaceId}/databases/${id}/schema?human=T`, schema, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })
      .then((response) => response.data)
      .catch((error) =>
        handleAxiosError(
          error,
          'Failed to Update Schema. Please consider updating your local version of the schema by importing the latest version from the target account.',
        ),
      )

  private async downloadImage(url: string, path: string) {
    try {
      const response = await axios({
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
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

  private async uploadImage(url: string, path: string) {
    // Create a new instance of FormData
    const formData = new FormData()

    // Append the file to the form data. The 'file' is the key by which the server expects the file binary.
    formData.append('file', fs.createReadStream(path))

    // Perform the PUT request with the form data
    return axios.post(url, formData, {
      headers: {
        // FormData will generate the correct Content-Type boundary itself
        ...formData.getHeaders(),
        Authorization: `Bearer ${this.apiKey}`,
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
