import axios, {AxiosError, AxiosInstance} from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

import {DB_BACKGROUND_FILE_NAME} from '../common/constants.js'
import {
  DatabaseMetadata,
  DatabaseSchemaType,
  DatabaseSettingsType,
  GetDatabaseResponse,
  Report,
  ViewType,
} from '../common/schema-validators.js'
import {NinoxCredentials, View} from '../common/types.js'

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
      // silently ignore 404 as the background image is optional
      if (error instanceof AxiosError && error?.response?.status === axios.HttpStatusCode.NotFound) {
        error?.request?.abort()
        return
      }

      throw error
    }
  }

  // TODO: Upload Report files is not yet supported due to the lack of use cases
  public async downloadReportFiles(databaseId: string, reportId: string, folderPath: string): Promise<unknown> {
    const reportFilesUrl = `/v1/teams/${this.workspaceId}/databases/${databaseId}/reports/${reportId}/files`

    return this.client
      .get(reportFilesUrl)
      .then((response) => {
        const files = response.data

        const downloadPromises = files.map(async (filename: string) => {
          const fileUrl = `/v1/teams/${this.workspaceId}/databases/${databaseId}/reports/${reportId}/files/${filename}`
          await fs.promises.mkdir(folderPath, {recursive: true})
          const writer = fs.createWriteStream(`${folderPath}/${filename}`)

          return this.client({
            method: 'GET',
            responseType: 'stream',
            url: fileUrl,
          }).then((fileResponse) => {
            fileResponse.data.pipe(writer)

            return new Promise((resolve, reject) => {
              writer.on('finish', resolve)
              writer.on('error', reject)
            })
          })
        })

        return Promise.all(downloadPromises)
      })
      .catch((error) => {
        // ignore 404 as the background image is optional
        if (error instanceof AxiosError && error?.response?.status === axios.HttpStatusCode.NotFound) {
          error?.request?.abort()
          return
        }

        handleAxiosError(error, 'Failed to download report files')
      })
  }

  public async getDatabase(id: string): Promise<GetDatabaseResponse> {
    return this.client
      .get(`/v1/teams/${this.workspaceId}/databases/${id}?formatScripts=T`)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to fetch database'))
  }

  public async getDatabaseReports(databaseId: string): Promise<Report[]> {
    return this.client
      .get(`/v1/teams/${this.workspaceId}/databases/${databaseId}/reports?fullReport=T`)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to list database reports'))
  }

  public async getDatabaseViews(databaseId: string): Promise<View[]> {
    return this.client
      .get(`/v1/teams/${this.workspaceId}/databases/${databaseId}/views?fullView=T`)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to list database views'))
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

  public async patchDatabaseSchemaInNinox(id: string, schema: DatabaseSchemaType): Promise<unknown> {
    return this.client
      .patch(`/v1/teams/${this.workspaceId}/databases/${id}/schema?formatScripts=T`, schema)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to update database Schema'))
  }

  public async updateDatabaseReportsInNinox(databaseId: string, reports: Report[]): Promise<unknown> {
    return this.client
      .post(`/v1/teams/${this.workspaceId}/databases/${databaseId}/reports`, reports)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to update database reports'))
  }

  public async updateDatabaseSettingsInNinox(id: string, settings: DatabaseSettingsType): Promise<unknown> {
    const data = JSON.stringify(settings)
    return this.client
      .post(`/${this.workspaceId}/${id}/settings/update`, data, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then((response) => response.data)
      .catch((error) =>
        handleAxiosError(
          error,
          'Failed to Update Database settings.' + JSON.stringify(error) + JSON.stringify(settings),
        ),
      )
  }

  public async updateDatabaseViewInNinox(databaseId: string, view: ViewType): Promise<unknown> {
    return this.client
      .post(`/${this.workspaceId}/${databaseId}/json/views/update`, JSON.stringify(view), {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to upload database view'))
  }

  // I can update all views in a Database with a single request
  // POST /databases/:dbid/views and views as array of ViewType
  public async updateDatabaseViewsInNinox(databaseId: string, views: ViewType[]): Promise<unknown> {
    return this.client
      .post(`/v1/teams/${this.workspaceId}/databases/${databaseId}/views`, views)
      .then((response) => response.data)
      .catch((error) => handleAxiosError(error, 'Failed to update database views'))
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
}

function handleAxiosError(error: unknown, message: string): void {
  if (error instanceof AxiosError) {
    const {message: errorMessage, response} = error
    const data = response?.data?.message ?? response?.data
    const message_ = `${message}\n${data ?? errorMessage ?? JSON.stringify(error)}`
    throw new Error(message_)
  }

  throw error
}
