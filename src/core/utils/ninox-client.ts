import axios, {AxiosError, AxiosInstance} from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

import {DB_BACKGROUND_FILE_NAME} from '../common/constants.js'
import {
  DatabaseMetadata,
  DatabaseSchemaType,
  DatabaseSettingsType,
  GetDatabaseResponse,
} from '../common/schema-validators.js'
import {NinoxCredentials} from '../common/types.js'

export class NinoxClient {
  public getDatabase = async (id: string): Promise<GetDatabaseResponse> =>
    this.client
      .get(`/v1/teams/${this.workspaceId}/databases/${id}?human=T`)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to fetch database'))

  public listDatabases = async (): Promise<DatabaseMetadata[]> =>
    this.client
      .get(`/v1/teams/${this.workspaceId}/databases`)
      .then((response) => response.data as DatabaseMetadata[])
      .catch((error) => {
        handleAxiosError(error, 'Failed to list databases')
        return []
      })

  public updateDatabaseSettings = async (id: string, settings: DatabaseSettingsType): Promise<unknown> => {
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

  public uploadDatabaseBackgroundImage = async (
    databaseId: string,
    imagePath: string,
    imageFileExists: boolean,
  ): Promise<boolean> => {
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

  public uploadDatabaseSchemaToNinox = async (id: string, schema: DatabaseSchemaType): Promise<unknown> =>
    this.client
      .patch(`/v1/teams/${this.workspaceId}/databases/${id}/schema?human=T`, schema)
      .then((response) => response.data)
      .catch((error) =>
        handleAxiosError(
          error,
          'Failed to Update Schema. Please consider updating your local version of the schema by importing the latest version from the target account.',
        ),
      )

  private apiKey: string

  private client: AxiosInstance

  private domain: string

  private workspaceId: string

  public constructor(creds: NinoxCredentials) {
    this.apiKey = creds.apiKey
    this.domain = creds.domain
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
    try {
      const response = await this.client({
        method: 'GET',
        responseType: 'stream',
        url: imageUrl,
      })

      // Create a write stream to save the file
      const writer = fs.createWriteStream(imagePath)

      // Pipe the response data to the file
      response.data.pipe(writer)

      return new Promise((resolve) => {
        writer.on('finish', resolve)
        writer.on('error', (error) => {
          console.log('Error downloading image', error)
        })
      })
    } catch (error) {
      // ignore 404 as the background image is optional
      if (error instanceof AxiosError && error?.response?.status === axios.HttpStatusCode.NotFound) {
        return
      }

      throw error
    }
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
