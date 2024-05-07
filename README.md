database-cli

Ninox DB cli


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/database-cli.svg)](https://npmjs.org/package/database-cli)
[![Downloads/week](https://img.shields.io/npm/dw/database-cli.svg)](https://npmjs.org/package/database-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g database-cli
$ dbcli COMMAND
running command...
$ dbcli (--version)
database-cli/0.0.0 darwin-arm64 node-v20.12.2
$ dbcli --help [COMMAND]
USAGE
  $ dbcli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dbcli hello PERSON`](#dbcli-hello-person)
* [`dbcli hello world`](#dbcli-hello-world)
* [`dbcli help [COMMAND]`](#dbcli-help-command)
* [`dbcli plugins`](#dbcli-plugins)
* [`dbcli plugins add PLUGIN`](#dbcli-plugins-add-plugin)
* [`dbcli plugins:inspect PLUGIN...`](#dbcli-pluginsinspect-plugin)
* [`dbcli plugins install PLUGIN`](#dbcli-plugins-install-plugin)
* [`dbcli plugins link PATH`](#dbcli-plugins-link-path)
* [`dbcli plugins remove [PLUGIN]`](#dbcli-plugins-remove-plugin)
* [`dbcli plugins reset`](#dbcli-plugins-reset)
* [`dbcli plugins uninstall [PLUGIN]`](#dbcli-plugins-uninstall-plugin)
* [`dbcli plugins unlink [PLUGIN]`](#dbcli-plugins-unlink-plugin)
* [`dbcli plugins update`](#dbcli-plugins-update)

## `dbcli hello PERSON`

Say hello

```
USAGE
  $ dbcli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ dbcli hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/Ninox/database-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `dbcli hello world`

Say hello world

```
USAGE
  $ dbcli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ dbcli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/Ninox/database-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `dbcli help [COMMAND]`

Display help for dbcli.

```
USAGE
  $ dbcli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for dbcli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.21/src/commands/help.ts)_

## `dbcli plugins`

List installed plugins.

```
USAGE
  $ dbcli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ dbcli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/index.ts)_

## `dbcli plugins add PLUGIN`

Installs a plugin into dbcli.

```
USAGE
  $ dbcli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into dbcli.

  Uses bundled npm executable to install plugins into /Users/muhammad/.local/share/dbcli

  Installation of a user-installed plugin will override a core plugin.

  Use the DBCLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the DBCLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ dbcli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ dbcli plugins add myplugin

  Install a plugin from a github url.

    $ dbcli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ dbcli plugins add someuser/someplugin
```

## `dbcli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ dbcli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ dbcli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/inspect.ts)_

## `dbcli plugins install PLUGIN`

Installs a plugin into dbcli.

```
USAGE
  $ dbcli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into dbcli.

  Uses bundled npm executable to install plugins into /Users/muhammad/.local/share/dbcli

  Installation of a user-installed plugin will override a core plugin.

  Use the DBCLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the DBCLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ dbcli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ dbcli plugins install myplugin

  Install a plugin from a github url.

    $ dbcli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ dbcli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/install.ts)_

## `dbcli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ dbcli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ dbcli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/link.ts)_

## `dbcli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ dbcli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dbcli plugins unlink
  $ dbcli plugins remove

EXAMPLES
  $ dbcli plugins remove myplugin
```

## `dbcli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ dbcli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/reset.ts)_

## `dbcli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ dbcli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dbcli plugins unlink
  $ dbcli plugins remove

EXAMPLES
  $ dbcli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/uninstall.ts)_

## `dbcli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ dbcli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dbcli plugins unlink
  $ dbcli plugins remove

EXAMPLES
  $ dbcli plugins unlink myplugin
```

## `dbcli plugins update`

Update installed plugins.

```
USAGE
  $ dbcli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/update.ts)_
<!-- commandsstop -->
