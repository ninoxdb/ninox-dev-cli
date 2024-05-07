export const ConfigYamlTemplate = {
  environments: {
    dev: {
      apiKey: "<API_KEY>",
      domain: "https://dev.ninoxdb.de",
      workspaceId: "123456789",
    },
    prod: {
      apiKey: "<API_KEY>",
      domain: "https://prod.ninoxdb.de",
      workspaceId: "123456789",
    },
  },
};

export const ERROR_MESSAGES = {
  DEPLOY_FAILED: "ERROR: Failed to deploy",
  ENV_NOT_FOUND: "ERROR: Environment not found in config.yaml",
  ENV_NOT_PROVIDED:
    "ERROR: Please provide the environment name as the first parameter",
  IMPORT_FAILED: "ERROR: Failed to import object",
  INIT_FAILED: "ERROR: Failed to initialize project",
  LIST_FAILED: "ERROR: Failed to list objects",
  NOT_IMPLEMENTED: "ERROR: Not implemented",
  PROJECT_NOT_INITIALIZED:
    "ERROR: Project not initialized. Please initialize a Ninox project in your current directory by executing 'ninox init -n <name>' command or create a config.yaml file manually.",
};

export const SUCCESS_MESSAGES = {
  DEPLOY_SUCCESS: "Success: Deploy command completed",
  IMPORT_SUCCESS: "Success: object import command completed",
  INIT_SUCCESS: "Success: Project initialized",
};

export const CREDENTIALS_FILE_NAME = "config.yaml";
export const DB_BACKGROUND_FILE_NAME = "background.jpg";
export const HELP_PARAM = ["--help", "-h"];
