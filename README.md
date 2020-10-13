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

deploy -f myapp.json                Deploy myapp
delete myapp                        Delete myapp
list                                List all deployments
config myapp                        Get deployment config for myapp
secrets list myapp                  List all secrets for myapp
secrets add myapp -k token -v xxx   Add a secret to myapp
secrets delete myapp -k token       Delete a secret from myapp
login                               Authenticate with a Krane server
```
