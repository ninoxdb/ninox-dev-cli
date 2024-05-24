export interface INinoxObjectService {
  download(id: string): Promise<void>
  list(): Promise<unknown[]>
  upload(id: string): Promise<void>
}
