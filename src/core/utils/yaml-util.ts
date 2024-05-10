import * as YAML from 'yaml'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createYamlDocument = (data: any) => {
  const doc = new YAML.Document()
  doc.contents = data
  return doc
}

export const parseYamlDocument = (yaml: string) => YAML.parse(yaml)
