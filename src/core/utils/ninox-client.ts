import axios, {AxiosError, AxiosInstance} from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

import {DB_BACKGROUND_FILE_NAME} from '../common/constants.js'
import {
  DatabaseMetadata,
  DatabaseSchemaType,
  DatabaseSettingsType,
  GetDatabaseResponse,
  ViewType,
} from '../common/schema-validators.js'
import {NinoxCredentials, View, ViewMetadata} from '../common/types.js'

export class NinoxClient {
  private client: AxiosInstance

  private workspaceId: string

  public constructor(creds: NinoxCredentials) {
    this.workspaceId = creds.workspaceId
    this.client = axios.create({
      baseURL: creds.domain,
      headers: {
        Authorization: `Bearer ${creds.apiKey}`,
      },
    })
  }

  // download the background image from /{accountId}/root/background.jpg
  public async downloadDatabaseBackgroundImage(databaseId: string, imagePath: string): Promise<void> {
    const imageUrl = `/${this.workspaceId}/${databaseId}/files/${DB_BACKGROUND_FILE_NAME}`
    // Create a write stream to save the file
    let writer: fs.WriteStream
    try {
      const response = await this.client({
        method: 'GET',
        responseType: 'stream',
        url: imageUrl,
      })
      writer = fs.createWriteStream(imagePath)
      // Pipe the response data to the file
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', (error) => {
          console.log('Error downloading image', error)
          writer.end()
          reject(error)
        })
      })
    } catch (error) {
      // ignore 404 as the background image is optional
      if (error instanceof AxiosError && error?.response?.status === axios.HttpStatusCode.NotFound) {
        error?.request?.abort()
        return
      }

      throw error
    }
  }

  public async getDatabase(id: string): Promise<GetDatabaseResponse> {
    return this.client
      .get(`/v1/teams/${this.workspaceId}/databases/${id}?human=T`)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to fetch database'))
  }

  public async getDatabaseView(databaseId: string, viewId: string): Promise<View> {
    return this.client
      .get(`/v1/teams/${this.workspaceId}/databases/${databaseId}/views/${viewId}`)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to fetch database views'))
  }

  public async listDatabases(): Promise<DatabaseMetadata[]> {
    return this.client
      .get(`/v1/teams/${this.workspaceId}/databases`)
      .then((response) => response.data as DatabaseMetadata[])
      .catch((error) => {
        handleAxiosError(error, 'Failed to list databases')
        return []
      })
  }

  public async listDatabaseViews(databaseId: string): Promise<ViewMetadata[]> {
    return this.client
      .get(`/v1/teams/${this.workspaceId}/databases/${databaseId}/views`)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to list database views'))
  }

  public async updateDatabaseSettings(id: string, settings: DatabaseSettingsType): Promise<unknown> {
    const data = JSON.stringify(settings)
    return this.client
      .post(`/${this.workspaceId}/${id}/settings/update`, data, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to Update Database settings.'))
  }

  public async uploadDatabaseBackgroundImage(
    databaseId: string,
    imagePath: string,
    imageFileExists: boolean,
  ): Promise<boolean> {
    if (!imageFileExists) {
      return false
    }

    const imageUrl = `/${this.workspaceId}/${databaseId}/files/${DB_BACKGROUND_FILE_NAME}`

    // Create a new instance of FormData
    const formData = new FormData()

    // Append the file to the form data. The 'file' is the key by which the server expects the file binary.
    formData.append('file', fs.createReadStream(imagePath))

    // Perform the PUT request with the form data
    await this.client
      .post(imageUrl, formData, {
        headers: {
          // FormData will generate the correct Content-Type boundary itself
          ...formData.getHeaders(),
        },
      })
      .catch(() => false)
    return true
  }

  public async uploadDatabaseSchemaToNinox(id: string, schema: DatabaseSchemaType): Promise<unknown> {
    return this.client
      .patch(`/v1/teams/${this.workspaceId}/databases/${id}/schema?human=T`, schema)
      .then((response) => response.data)
      .catch((error) =>
        handleAxiosError(
          error,
          'Failed to Update Schema. Please consider updating your local version of the schema by importing the latest version from the target account.',
        ),
      )
  }

  public async uploadDatabaseView(databaseId: string, view: ViewType): Promise<unknown> {
    return this.client
      .post(`/${this.workspaceId}/${databaseId}/json/views/update`, JSON.stringify(view), {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to upload database view'))
  }
}

function handleAxiosError(error: unknown, message: string): void {
  if (error instanceof AxiosError) {
    const {message: errorMessage, response} = error
    const data = response?.data?.message ?? response?.data
    const message_ = `${message}\n${data ?? errorMessage}`
    throw new Error(message_)
  }

  throw error
}
