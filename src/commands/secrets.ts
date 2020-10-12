import { cli } from "cli-ux";
import { createAppContext } from "./../context/Context";
import { KraneClient } from "@krane/common";
import { Command, flags } from "@oclif/command";

export default class Secrets extends Command {
  ctx = createAppContext();

  static description = "describe the command here";

  static flags = {
    key: flags.string({
      char: "k",
      description: "Secret value",
    }),
    value: flags.string({
      char: "v",
      description: "Secret value",
    }),
  };

  static args = [
    {
      name: "subcommand",
      required: true,
      options: ["add", "list"],
    },
    {
      name: "deployment",
      required: true,
      description: "Deployment name",
    },
  ];

  async run() {
    await this.ctx.init();

    const { args, flags } = this.parse(Secrets);

    switch (args.subcommand) {
      case "add":
        if (flags.key == null || flags.value == null) {
          this.error("Missing required key or value");
        }

        await this.add(args.deployment, flags.key!!, flags.value!!);
        break;
      case "list":
        await this.list(args.deployment);
        break;
      default:
        this.error(`Unknown command ${args.subcommand}`);
    }
  }

  async must(value: string) {
    if (value == null || value == "") {
      throw new Error("Value must not be empty");
    }
  }

  async add(deploymentName: string, key: string, value: string) {
    try {
      const secret = await this.client.addSecret(deploymentName, key, value);
      this.log(
        `\nSecret added ✅ \nYou can refer to this secret in your krane.json with the following alias: \n${secret?.alias} 
        \nFor more details on configuring secrets checkout: \nhttps://www.krane.sh/#/04-configuration?id=secrets`
      );
    } catch (e) {
      this.error(`Unable to add secret for ${deploymentName}`);
    }
  }

  async list(deploymentName: string) {
    try {
      const secrets = await this.client.getSecrets(deploymentName);
      cli.table(secrets, {
        alias: {
          get: (secret) => secret.alias,
          minWidth: 20,
        },
        key: {
          get: (secret) => secret.key,
          minWidth: 30,
        },
      });
    } catch (e) {
      this.error(`Unable to get secrets for ${deploymentName}`);
    }
  }

  get client(): KraneClient {
    // todo: memoize?
    const { token } = this.ctx.authState.getTokenInfo();
    return new KraneClient(this.ctx.serverEndpoint, token);
  }
}
