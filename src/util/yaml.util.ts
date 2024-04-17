import YAML from "yaml";

export const createYamlDocument = (data: any) => {
  const doc = new YAML.Document();
  doc.contents = data;
  return doc;
};
