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
$ ninox COMMAND
running command...
$ ninox (--version)
database-cli/0.0.0 darwin-arm64 node-v20.12.2
$ ninox --help [COMMAND]
USAGE
  $ ninox COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ninox hello PERSON`](#ninox-hello-person)
* [`ninox hello world`](#ninox-hello-world)
* [`ninox help [COMMAND]`](#ninox-help-command)
* [`ninox plugins`](#ninox-plugins)
* [`ninox plugins add PLUGIN`](#ninox-plugins-add-plugin)
* [`ninox plugins:inspect PLUGIN...`](#ninox-pluginsinspect-plugin)
* [`ninox plugins install PLUGIN`](#ninox-plugins-install-plugin)
* [`ninox plugins link PATH`](#ninox-plugins-link-path)
* [`ninox plugins remove [PLUGIN]`](#ninox-plugins-remove-plugin)
* [`ninox plugins reset`](#ninox-plugins-reset)
* [`ninox plugins uninstall [PLUGIN]`](#ninox-plugins-uninstall-plugin)
* [`ninox plugins unlink [PLUGIN]`](#ninox-plugins-unlink-plugin)
* [`ninox plugins update`](#ninox-plugins-update)

## `ninox hello PERSON`

Say hello

```
USAGE
  $ ninox hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ ninox hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/Ninox/database-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `ninox hello world`

Say hello world

```
USAGE
  $ ninox hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ ninox hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/Ninox/database-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `ninox help [COMMAND]`

Display help for ninox.

```
USAGE
  $ ninox help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ninox.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.21/src/commands/help.ts)_

## `ninox plugins`

List installed plugins.

```
USAGE
  $ ninox plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ ninox plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/index.ts)_

## `ninox plugins add PLUGIN`

Installs a plugin into ninox.

```
USAGE
  $ ninox plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

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
  Installs a plugin into ninox.

  Uses bundled npm executable to install plugins into /Users/muhammad/.local/share/ninox

  Installation of a user-installed plugin will override a core plugin.

  Use the ninox_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the ninox_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ ninox plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ ninox plugins add myplugin

  Install a plugin from a github url.

    $ ninox plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ ninox plugins add someuser/someplugin
```

## `ninox plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ ninox plugins inspect PLUGIN...

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
  $ ninox plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/inspect.ts)_

## `ninox plugins install PLUGIN`

Installs a plugin into ninox.

```
USAGE
  $ ninox plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

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
  Installs a plugin into ninox.

  Uses bundled npm executable to install plugins into /Users/muhammad/.local/share/ninox

  Installation of a user-installed plugin will override a core plugin.

  Use the ninox_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the ninox_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ ninox plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ ninox plugins install myplugin

  Install a plugin from a github url.

    $ ninox plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ ninox plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/install.ts)_

## `ninox plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ ninox plugins link PATH [-h] [--install] [-v]

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
  $ ninox plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/link.ts)_

## `ninox plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ninox plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ninox plugins unlink
  $ ninox plugins remove

EXAMPLES
  $ ninox plugins remove myplugin
```

## `ninox plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ ninox plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/reset.ts)_

## `ninox plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ninox plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ninox plugins unlink
  $ ninox plugins remove

EXAMPLES
  $ ninox plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/uninstall.ts)_

## `ninox plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ninox plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ninox plugins unlink
  $ ninox plugins remove

EXAMPLES
  $ ninox plugins unlink myplugin
```

## `ninox plugins update`

Update installed plugins.

```
USAGE
  $ ninox plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/update.ts)_
<!-- commandsstop -->
