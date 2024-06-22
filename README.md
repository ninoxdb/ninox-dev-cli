nx-cli

Ninox Dev CLI


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nx-cli.svg)](https://npmjs.org/package/nx-cli)
[![Downloads/week](https://img.shields.io/npm/dw/nx-cli.svg)](https://npmjs.org/package/nx-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @ninox/ninox
$ ninox COMMAND
running command...
$ ninox (--version)
@ninox/ninox/0.1.2 darwin-arm64 node-v20.15.0
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

_See code: [src/commands/database/download.ts](https://github.com/ninoxdb/ninox-dev-cli/blob/v0.1.2/src/commands/database/download.ts)_

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

_See code: [src/commands/database/list.ts](https://github.com/ninoxdb/ninox-dev-cli/blob/v0.1.2/src/commands/database/list.ts)_

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

_See code: [src/commands/database/upload.ts](https://github.com/ninoxdb/ninox-dev-cli/blob/v0.1.2/src/commands/database/upload.ts)_

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

_See code: [src/commands/project/init.ts](https://github.com/ninoxdb/ninox-dev-cli/blob/v0.1.2/src/commands/project/init.ts)_
<!-- commandsstop -->
