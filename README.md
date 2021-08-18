<img src="https://github.com/krane/krane/blob/main/docs/assets/krane-wordmark.png?raw=true" width="350">

> A command-line tool for managing insfrastructure running on [Krane](https://github.com/krane/krane)

[![npm version](https://img.shields.io/npm/v/krane?color=#D0BB79&label=npm)](https://www.npmjs.com/package/krane)

**Official Documentation:** https://docs.krane.sh/#/docs/cli

### Install

You can install the Krane CLI using [npm](https://www.npmjs.com/package/krane). The following command will install the cli globally allowing you to run `krane` commands from anywhere on your machine. Note that this requires node to be installed on your machine.

```sh
npm i -g krane
```

### Update 

```sh
npm update -g krane
```

### Examples

```sh
# Display CLI usage and commands
$ krane help 

# Authenticate with a Krane instance
$ krane login https://krane.example.com

# List all deployments
$ krane list 

# Returns information about the containers for a deployment
$ krane status <deployment>

# Stream realtime deployment logs
$ krane logs <deployment>
```

Checkout the [official docs site](https://docs.krane.sh/#/docs/cli) for the complete list of available commands.

## Contributing

The Krane CLI is written in Typescript using the [OCLIF](https://oclif.io/) framework.

Commands are located under the [/src/commands](https://github.com/krane/cli/tree/master/src/commands) directory
