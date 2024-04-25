export const ConfigYamlTemplate = {
  environments: {
    dev: {
      domain: "https://dev.ninoxdb.de",
      workspaceId: "123456789",
      apiKey: "<API_KEY>",
    },
    prod: {
      domain: "https://prod.ninoxdb.de",
      workspaceId: "123456789",
      apiKey: "<API_KEY>",
    },
  },
};

export const CREDENTIALS_FILE_NAME = "config.yaml";