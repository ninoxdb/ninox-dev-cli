export interface INinoxObjectService<T> {
  download(id: string): Promise<void>
  list(): Promise<T[]>
  upload(id: string): Promise<void>
}
