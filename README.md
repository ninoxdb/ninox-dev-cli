
Ninox SDK CLI Tool


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nx-cli.svg)](https://npmjs.org/package/nx-cli)
[![Downloads/week](https://img.shields.io/npm/dw/nx-cli.svg)](https://npmjs.org/package/nx-cli)

<!-- toc -->
* [Getting Started](#getting-started)
* [Usage](#usage)
* [Commands](#commands)
* [Installation](#installation)
* [Best practices](#best-practices)
<!-- tocstop -->

Ninox-cli is a powerful command-line interface designed for Ninox builders to enhance their development workflows. It allows you to connect to your Ninox cloud instance to manage Ninox database configurations; to perform operations such as downloading and uploading a database configuration, for better management of the development process.

# Getting Started
<!-- getting-started -->
It is configured with the Ninox cloud's credentials. To get started, run the following command, to initialize a new Ninox-cli project in the current directory:
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


# Usage
<!-- usage -->
```sh-session
$ npm install -g @ninox/ninox
$ ninox COMMAND
running command...
$ ninox (--version)
@ninox/ninox/0.1.4 darwin-arm64 node-v20.15.0
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
  $ ninox database download ENV -i <value>

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
  $ ninox database list ENV

DESCRIPTION
  List all the database names and ids in the Ninox cloud server. The ENV argument comes before the command name.

EXAMPLES
  $ ninox DEV database list
```

## `ninox database upload`

Deploy the local database configuration to the Ninox cloud server. The ENV argument comes before the command name.

```
USAGE
  $ ninox database upload ENV -i <value>

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

# Installation
To install the latest version of the Ninox CLI tool, run the following command:
```sh-session
$ npm install -g @ninox/ninox
```

# Best practices
1. Single Database Operations: Both download and upload commands work on one database at a time. You need to specify the Database ID for each operation.
2. Existing Databases Only: The current version of the Ninox CLI only supports updating existing databases. You cannot use this tool to create a new database from scratch.
3. Supported Modifications: While you can't create new databases, you can make the following changes to existing databases:
    a. Create new tables
    b. Add new pages
    c. Define new fields
    d. Write new Ninox scripts
4. Local Storage: After downloading, all database artifacts are stored as YAML files in your current working directory. Ensure you're in the correct directory when running the upload command.
5. Version Control: It's recommended to keep these YAML files under version control to track changes and collaborate with team members.
6. Review Before Upload: Always review your local changes before uploading to ensure you're not overwriting important configurations unintentionally and to always back up the configuration yaml files in a source control, before making significant changes.
