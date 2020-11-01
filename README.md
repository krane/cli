![CLI](https://res.cloudinary.com/biensupernice/image/upload/v1602471644/Marketing_-_Krane_CLI_zfw8vh.png)

A command-line tool for working with [Krane](https://krane.sh)

![publish-npm](https://github.com/krane/cli/workflows/publish-npm/badge.svg?branch=master&event=push)

## Install

```
npm i -g @krane/cli
```

```
$ krane [COMMAND]

COMMANDS

deploy -f myapp.json                Deploy
delete myapp                        Delete a deployment
list                                List all deployments
config myapp                        Get the deployment configuration
secrets list myapp                  List all secrets for a deployment
secrets add myapp -k token -v xxx   Add a secret to a deployment
secrets delete myapp -k token       Delete a secret from a deployment
login                               Authenticate with a Krane server
```
