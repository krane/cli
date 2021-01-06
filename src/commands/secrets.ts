import { cli } from "cli-ux";
import { flags } from "@oclif/command";

import BaseCommand from "../base";

export default class Secrets extends BaseCommand {
  static description = "Add, delete, or list deployment secrets.";

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
      options: ["add", "delete", "list"],
    },
    {
      name: "deployment",
      required: true,
      description: "Deployment name",
    },
  ];

  async run() {
    const { args, flags } = this.parse(Secrets);

    switch (args.subcommand) {
      case "add":
        await this.add(args.deployment, flags.key!!, flags.value!!);
        break;
      case "delete":
        await this.delete(args.deployment, flags.key!!);
        break;
      case "list":
        await this.list(args.deployment);
        break;
      default:
        this.error(`Unknown command ${args.subcommand}`);
    }
  }

  async add(deploymentName: string, key: string, value: string) {
    if (key == null || value == null) {
      this.error("Missing required key or value");
    }

    try {
      const client = await this.getKraneClient();
      const secret = await client.addSecret(deploymentName, key, value);
      this.log(
        `\nSecret added ✅ \nYou can refer to this secret in your krane.json with the following alias: \n${secret?.alias} 
        \nFor more details on configuring secrets checkout: \nhttps://www.krane.sh/#/deployment-configuration?id=secrets`
      );
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to add secret");
    }
  }

  async delete(deploymentName: string, key: string) {
    try {
      const client = await this.getKraneClient();
      await client.deleteSecret(deploymentName, key);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to remove secret");
    }
  }

  async list(deploymentName: string) {
    try {
      const client = await this.getKraneClient();
      const secrets = await client.getSecrets(deploymentName);
      cli.table(secrets, {
        key: {
          get: (secret) => secret.key,
          minWidth: 10,
        },
        alias: {
          get: (secret) => secret.alias,
          minWidth: 10,
        },
      });
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to list secrets");
    }
  }
}
