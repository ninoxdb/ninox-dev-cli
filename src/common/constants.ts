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

export const ERROR_MESSAGES = {
  PROJECT_NOT_INITIALIZED:
    "ERROR: Project not initialized. Please initialize a Ninox project in your current directory by executing 'ninox init -n <name>' command or create a config.yaml file manually.",
  ENV_NOT_PROVIDED:
    "ERROR: Please provide the environment name as the first parameter",
  DEPLOY_FAILED: "ERROR: Failed to deploy",
  INIT_FAILED: "ERROR: Failed to initialize project",
  IMPORT_FAILED: "ERROR: Failed to import object",
  LIST_FAILED: "ERROR: Failed to list objects",
  NOT_IMPLEMENTED: "ERROR: Not implemented",
  ENV_NOT_FOUND: "ERROR: Environment not found in config.yaml",
};

export const SUCCESS_MESSAGES = {
  DEPLOY_SUCCESS: "Success: Deploy command completed",
  INIT_SUCCESS: "Success: Project initialized",
  IMPORT_SUCCESS: "Success: object import command completed",
};

export const CREDENTIALS_FILE_NAME = "config.yaml";
export const DB_BACKGROUND_FILE_NAME = "background.jpg";
export const HELP_PARAM = ["--help", "-h"];
