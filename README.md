# Ninox command-line interface (CLI) tool

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nx-cli.svg)](https://npmjs.org/package/nx-cli)
[![Downloads/week](https://img.shields.io/npm/dw/nx-cli.svg)](https://npmjs.org/package/nx-cli)

The Ninox CLI tool enhances development workflows for advanced Ninox users by enabling source code version management. You can use the Ninox CLI tool on any command-line interface to connect your Ninox cloud instance to your local development setup and a version control system (for example, GitHub). This allows you to manage your database configurations, including downloading configurations for local development and uploading them back to the cloud.

<!-- toc -->
* [Ninox command-line interface (CLI) tool](#ninox-command-line-interface-cli-tool)
* [Installation](#installation)
* [Get started](#get-started)
* [Manage database configurations](#manage-database-configurations)
* [Features](#features)
* [Limitations](#limitations)
* [Usage](#usage)
* [Ninox CLI commands](#ninox-cli-commands)
* [Best practices](#best-practices)
<!-- tocstop -->

# Installation

To install the latest version of the Ninox CLI tool (requires NodeJS LTS version 18 or higher), run:

```sh-session
$ npm install -g @ninox/ninox
```

# Get started

<!-- get-started -->

The Ninox CLI is configured with your Ninox cloud credentials. To get started:

  1. Open Terminal on Unix-like systems (macOS, Linux) or Command Prompt on Windows.
  2. Create a new directory and navigate to it. This directory will store your Ninox CLI project files.
  3. Run the following command to initialize a new Ninox CLI project in the current directory:
```sh-session
$ ninox project init <PROJECT_NAME>
```
This command creates a `config.yaml` file in the directory, which contains the configuration details for your Ninox instance.

 4. Open the `config.yaml` file and input include your Ninox instance details. Here is an example:
```yaml
environments:
  dev:
    domain: https://DEV_DOMAIN_NAME.ninox.com
    apiKey: DEV_API_KEY
    workspaceId: DEV_WORKSPACE_ID
  prod:
    domain: https://PROD_DOMAIN_NAME.ninox.com
    apiKey: PROD_API_KEY
    workspaceId: PROD_WORKSPACE_ID
```
Replace the placeholder values with your actual Ninox instance details.

 5. After entering your Ninox cloud credentials into the `config.yaml` file and naming the environments, you can start using the Ninox CLI tool to list, download, or upload databases from the specified workspace environment.

## Authentication

Authentication is handled through the `config.yaml` file. The CLI tool uses the API key from this file for the environment specified in the command, such as `ninox local database download -i 1234`.
<!-- setupstop -->

# Manage database configurations

<!-- manage-database-configurations -->
The Ninox CLI provides two primary commands for managing database configurations: **`download`** and **`upload`**. Both commands operate on a single database at a time, identified by its unique database ID.

## Download a database configuration

The `download` command retrieves all database artifacts from the Ninox cloud server and saves them as YAML files in a predefined hierarchy within the current directory of your command line.

For example, to download all configuration files for the database with ID `1234` from the development (`DEV`) environment, run:

```sh-session
$ ninox DEV database download -i 1234
```

## Upload a database configuration

The `upload` command takes the configuration files from your local file system and deploys them to the Ninox cloud server.

For example, to upload the locally stored configuration files for the database with ID `1234` to the development (`DEV`) environment, run:

```sh-session
$ ninox DEV database upload -i 1234
```
<!-- manage-database-configurationsstop -->

# Features

 - Update and edit scripts for table and field events.
 - Write and modify scripts for business process automation.
 - Work offline with database configurations.

# Limitations

 - Cannot create new databases.
 - Cannot add new tables or fields.
 - Cannot modify existing field structures.
 - Not designed for making schema changes. (**Note**: All schema changes, such as creating or modifying tables and fields, must be made exclusively through the Ninox application.)

# Usage

<!-- usage -->
```sh-session
$ npm install -g @ninox/ninox
$ ninox COMMAND
running command...
$ ninox (--version)
@ninox/ninox/0.1.9 darwin-arm64 node-v22.11.0
$ ninox --help [COMMAND]
USAGE
  $ ninox COMMAND
...
```
<!-- usagestop -->

# Ninox CLI commands

<!-- ninox-cli-commands -->
* [`ninox project init`](#ninox-project-init)
* [`ninox database download`](#ninox-database-download)
* [`ninox database upload`](#ninox-database-upload)
* [`ninox database list`](#ninox-database-list)

## `ninox project init`

Run this command to initialize a new Ninox project in the current directory.

```
USAGE
  $ ninox project init <PROJECT_NAME>

ARGUMENTS
  <PROJECT_NAME>  Name of the Ninox project.

DESCRIPTION
  Initializes a new Ninox project in the current directory.

EXAMPLE
  $ ninox project init My-Project
```

## `ninox database download`

Run this command to download the settings and configuration (tables, fields, views, and reports) of a Ninox database to the local file system. The `ENV` argument comes before the command name, such as `ninox DEV database download -i 1234`.

```
USAGE
  $ ninox <ENV> database download -i <DATABASE_ID>

FLAGS
  -i, --id=<DATABASE_ID>  Required: The ID of the database to download.

DESCRIPTION
  Downloads the settings and configuration (tables, fields, views, and reports) of a Ninox database to the local
  file system.

EXAMPLE
  $ ninox DEV database download -i 1234
```

## `ninox database upload`

Run this command to deploy the local database configuration to the Ninox cloud server. The `ENV` argument comes before the command name.

```
USAGE
  $ ninox <ENV> database upload -i <DATABASE_ID>

FLAGS
  -i, --id=<DATABASE_ID>  Required: The ID of the database to upload.

DESCRIPTION
  Deploys the local database configuration to the Ninox cloud server.

EXAMPLE
  $ ninox DEV database upload -i 1234
```

## `ninox database list`

Run this command to view a list of all the database names and IDs in the Ninox cloud server. The `ENV` argument comes before the command name.

```
USAGE
  $ ninox <ENV> database list

DESCRIPTION
  Lists all the database names and IDs in the Ninox cloud server.

EXAMPLE
  $ ninox DEV database list
```
<!-- ninox-cli-commandsstop -->

# Best practices

 1. **Schema versioning**: The Ninox CLI uses schema versioning to prevent accidental overwriting of database configurations. The schema version increments with each update made in the Ninox app or via the CLI `upload` command. Uploads will fail if the local version doesn't match the server version. To resolve conflicts:
	 1. Back up your current work.
	 2. Download the latest database configuration.
	 3. Apply your changes to the updated configuration.
	 4. Upload the revised configuration.
 2. **Single database operations**: Each download or upload command operates on one database at a time. Always specify the database ID for each operation.
 3. **Existing databases only**: The Ninox CLI only supports updating existing databases. You can't use this tool to create new databases from scratch.
 4. **Supported modifications**: You can use the tool to make the following changes to existing databases:
   - Update existing scripts.
   - Create new scripts for automation.
   - Modify pages and layouts.
 5. **Local storage**: Downloaded database artifacts are stored as YAML files in your current working directory. Make sure you're in the correct directory when running commands.
 6. **Version control**: Keep YAML files under version control to track changes and facilitate team collaboration.
 7. **Review before upload**: Always review your local changes before uploading to avoid unintentional overwrites. Regularly back up configuration YAML files in source control, especially before making significant changes.
 8. **Collaborative work**: When multiple team members use the Ninox CLI on the same database, coordinate efforts to prevent conflicts. Use the schema versioning system to manage concurrent work.
