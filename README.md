
Ninox SDK CLI Tool


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nx-cli.svg)](https://npmjs.org/package/nx-cli)
[![Downloads/week](https://img.shields.io/npm/dw/nx-cli.svg)](https://npmjs.org/package/nx-cli)

<!-- toc -->
* [Installation](#installation)
* [Getting Started](#getting-started)
* [Capabilities](#capabilities)
* [Limitations](#limitations)
* [Usage](#usage)
* [Commands](#commands)
* [Best practices](#best-practices)
<!-- tocstop -->

Ninox-cli is a powerful command-line interface designed for Ninox builders to enhance their development workflows. It allows you to connect to your Ninox cloud instance to manage Ninox database configurations; to perform operations such as downloading and uploading a database configuration, for better management of the development process.

# Installation
To install the latest version of the Ninox CLI tool, run the following command (requires NodeJS LTS version 18 or higher):
```sh-session
$ npm install -g @ninox/ninox
```

# Getting Started
<!-- getting-started -->
The Ninox CLI is configured with your Ninox cloud's credentials. To get started, with Terminal on (*)nix or Command Prompt on Windows:
1. Create a new directory and change your cmd/terminal to this directory, where the Ninox CLI project files will be stored (following step).
2. Run the following command, to initialize a new Ninox-cli project in the current directory:
```sh-session
$ ninox project init <project-name>
```
A file named config.yaml will be created in the current directory. This file contains the configuration details for your Ninox instance. Here's an example of the config.yaml file:
```yaml
environments:
  dev:
    domain: https://your-dev-domain.ninox.com
    apiKey: your-dev-api-key
    workspaceId: your-dev-workspace-id
  prod:
    domain: https://your-prod-domain.ninox.com
    apiKey: your-prod-api-key
    workspaceId: your-prod-workspace-id
```
Replace the placeholder values with your actual Ninox instance details.
3. After entering your Ninox Cloud's credentials into the config.yaml file and giving a suitable name to the environment, you can now start using the Ninox CLI tool to list, download or upload all the databases of the workspace specified in the environment.

## Authentication
Authentication is handled through the config.yaml file. The CLI tool uses the API key specified in the configuration file for the environment name, specified in the command (e.g  ninox local database download -i 1234 )


## Working with Database Configurations
The Ninox CLI provides two primary commands for managing database configurations: **download** and **upload**. Both commands operate on a single database at a time, identified by its unique Database ID.


## Downloading a Database Configuration
The download command is straightforward:
1. You provide the Database ID of the specific database you want to download.
2. The command retrieves all database artifacts from the Ninox cloud server.
3. These artifacts are then saved as YAML files in a predefined hierarchy within the current directory of your command line.

```sh-session
$ ninox DEV database download -i 1234
```
This command will download all configuration files for the database with ID 1234 from your development environment.

## Uploading a Database Configuration
The upload command is the reverse of the download command. It takes the configuration files from your local filesystem and deploys them to the Ninox cloud server.

```sh-session
$ ninox DEV database upload -i 1234
```
This command will upload the locally stored configuration files for the database with ID 5678 to the Database with id 1234 in the DEV environment.



# Capabilities

- Update and edit scripts for Table and Field events
- Write and modify scripts for business process automation
- Work offline with database configurations

# Limitations

- Cannot create new databases
- Cannot add new tables or fields
- Cannot modify existing field structures
- Not designed for making schema changes (Important: all schema i.e tables/fields changes must be made exclusively through the Ninox application)


# Usage
<!-- usage -->
```sh-session
$ npm install -g @ninox/ninox
$ ninox COMMAND
running command...
$ ninox (--version)
@ninox/ninox/0.1.5 darwin-arm64 node-v20.15.0
$ ninox --help [COMMAND]
USAGE
  $ ninox COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ninox database download`](#ninox-database-download)
* [`ninox database list`](#ninox-database-list)
* [`ninox database upload`](#ninox-database-upload)
* [`ninox project init NAME`](#ninox-project-init-name)

## `ninox database download`

Download the settings and configuration (i.e Tables, Fields, Views and Reports) of a Ninox database to the local filesystem. The ENV argument comes before the command name e.g ninox <ENV> database download -i 1234.

```
USAGE
  $ ninox ENV database download -i <value>

FLAGS
  -i, --id=<value>  (required) Database ID to Download

DESCRIPTION
  Download the settings and configuration (i.e Tables, Fields, Views and Reports) of a Ninox database to the local
  filesystem. The ENV argument comes before the command name e.g ninox <ENV> database download -i 1234.

EXAMPLES
  $ ninox DEV database download -i 1234
```

## `ninox database list`

List all the database names and ids in the Ninox cloud server. The ENV argument comes before the command name.

```
USAGE
  $ ninox ENV database list

DESCRIPTION
  List all the database names and ids in the Ninox cloud server. The ENV argument comes before the command name.

EXAMPLES
  $ ninox DEV database list
```

## `ninox database upload`

Deploy the local database configuration to the Ninox cloud server. The ENV argument comes before the command name.

```
USAGE
  $ ninox ENV database upload -i <value>

FLAGS
  -i, --id=<value>  (required) Database ID to Download

DESCRIPTION
  Deploy the local database configuration to the Ninox cloud server. The ENV argument comes before the command name.

EXAMPLES
  $ ninox DEV database upload -i 1234
```

## `ninox project init NAME`

Initialize a new Ninox project in the current directory

```
USAGE
  $ ninox project init NAME

ARGUMENTS
  NAME  Name of the Ninox project

DESCRIPTION
  Initialize a new Ninox project in the current directory

EXAMPLES
  $ ninox project init
```
<!-- commandsstop -->

# Best practices
1. Schema Versioning: This mechanism prevents accidental overwriting of database configurations. The schema version increments with each update made in the Ninox app or via the CLI upload command. Uploads will fail if the local version doesn't match the server version. To resolve conflicts:
    1. Back up your current work
    2. Download the latest database configuration
    3. Apply your changes to the updated configuration
    4. Upload the revised configuration

2. Single Database Operations: Each download or upload command operates on one database at a time. Always specify the Database ID for operations.
3. Existing Databases Only: The Ninox CLI supports updating existing databases only. You cannot create new databases from scratch.
4. Supported Modifications:
    1. Update existing scripts
    2. Create new scripts for automation
    3. Modify pages and layouts
5. Local Storage: Downloaded database artifacts are stored as YAML files in your current working directory. Ensure you're in the correct directory when running commands.
6. Version Control: Keep YAML files under version control to track changes and facilitate team collaboration.
7. Review Before Upload: Always review local changes before uploading to avoid unintentional overwrites. Regularly back up configuration YAML files in source control, especially before making significant changes.
8. Collaborative Work: When multiple team members use the Ninox CLI on the same database, coordinate efforts to prevent conflicts. Use the schema versioning system to manage concurrent work.
