krane-cli
=========

CLI for krane-server

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/krane-cli.svg)](https://npmjs.org/package/krane-cli)
[![Downloads/week](https://img.shields.io/npm/dw/krane-cli.svg)](https://npmjs.org/package/krane-cli)
[![License](https://img.shields.io/npm/l/krane-cli.svg)](https://github.com/biensupernice/krane-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g krane
$ krane COMMAND
running command...
$ krane (-v|--version|version)
krane/0.0.1 darwin-x64 node-v14.5.0
$ krane --help [COMMAND]
USAGE
  $ krane COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`krane delete [FILE]`](#krane-delete-file)
* [`krane deploy`](#krane-deploy)
* [`krane help [COMMAND]`](#krane-help-command)
* [`krane login [ENDPOINT]`](#krane-login-endpoint)
* [`krane status [DEPLOYMENT]`](#krane-status-deployment)

## `krane delete [FILE]`

describe the command here

```
USAGE
  $ krane delete [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/delete.ts](https://github.com/biensupernice/krane-cli/blob/v0.0.1/src/commands/delete.ts)_

## `krane deploy`

Deploy a spec

```
USAGE
  $ krane deploy

OPTIONS
  -f, --file=file
  -t, --tag=tag
```

_See code: [src/commands/deploy.ts](https://github.com/biensupernice/krane-cli/blob/v0.0.1/src/commands/deploy.ts)_

## `krane help [COMMAND]`

display help for krane

```
USAGE
  $ krane help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `krane login [ENDPOINT]`

Authenticate to a Krane server

```
USAGE
  $ krane login [ENDPOINT]
```

_See code: [src/commands/login.ts](https://github.com/biensupernice/krane-cli/blob/v0.0.1/src/commands/login.ts)_

## `krane status [DEPLOYMENT]`

Get deployment status

```
USAGE
  $ krane status [DEPLOYMENT]

OPTIONS
  -a, --all
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)
```

_See code: [src/commands/status.ts](https://github.com/biensupernice/krane-cli/blob/v0.0.1/src/commands/status.ts)_
<!-- commandsstop -->
