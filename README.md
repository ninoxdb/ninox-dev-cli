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
$ npm install -g ninox
$ ninox COMMAND
running command...
$ ninox (--version)
ninox/0.1.0 darwin-arm64 node-v20.12.2
$ ninox --help [COMMAND]
USAGE
  $ ninox COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ninox database list`](#ninox-database-list)
* [`ninox download`](#ninox-download)
* [`ninox init NAME`](#ninox-init-name)
* [`ninox upload`](#ninox-upload)

## `ninox database list`

describe the command here

```
USAGE
  $ ninox database list ENV

DESCRIPTION
  describe the command here

EXAMPLES
  $ ninox database list
```

_See code: [src/commands/database/list.ts](https://github.com/ninoxdb/ninox-dev-cli/blob/v0.1.0/src/commands/database/list.ts)_

## `ninox download`

describe the command here

```
USAGE
  $ ninox download ENV -i <value>

FLAGS
  -i, --id=<value>  (required) Database ID to Download

DESCRIPTION
  describe the command here

EXAMPLES
  $ ninox download
```

_See code: [src/commands/download.ts](https://github.com/ninoxdb/ninox-dev-cli/blob/v0.1.0/src/commands/download.ts)_

## `ninox init NAME`

describe the command here

```
USAGE
  $ ninox init NAME

ARGUMENTS
  NAME  Name of the Ninox project

DESCRIPTION
  describe the command here

EXAMPLES
  $ ninox init
```

_See code: [src/commands/init.ts](https://github.com/ninoxdb/ninox-dev-cli/blob/v0.1.0/src/commands/init.ts)_

## `ninox upload`

describe the command here

```
USAGE
  $ ninox upload ENV -i <value>

FLAGS
  -i, --id=<value>  (required) Database ID to Download

DESCRIPTION
  describe the command here

EXAMPLES
  $ ninox upload
```

_See code: [src/commands/upload.ts](https://github.com/ninoxdb/ninox-dev-cli/blob/v0.1.0/src/commands/upload.ts)_
<!-- commandsstop -->
