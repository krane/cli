![CLI](https://res.cloudinary.com/biensupernice/image/upload/v1602471644/Marketing_-_Krane_CLI_zfw8vh.png)

CLI for managing container resources using [Krane](https://krane.sh)

![publish-npm](https://github.com/krane/cli/workflows/publish-npm/badge.svg?branch=master&event=push)

## Install

```
npm i -g @krane/cli
```

```
$ krane [COMMAND]

COMMANDS

deploy -f krane.json              Create a deployment
delete <deployment>               Delete a deployment
list                              List all deployments
secrets add <deployment> -k -v    Add a secret for a deployment
secrets list <deployment>         List all secrets for a deployment
login                             Authenticate with a Krane server
```
