import { cli } from "cli-ux";
import { flags } from "@oclif/command";

import BaseCommand from "../base";
import { Secret } from "@krane/common";

export default class Secrets extends BaseCommand {
  static description = `Add, delete, or list deployment secrets
  Check out https://docs.krane.sh/#/docs/cli?id=secrets for additional documentation
  `;

  static examples = [
    "$ krane secrets ls <deployment>",
    "$ krane secrets list <deployment>",
    "$ krane secrets add <deployment> --key TOKEN --value super-secret-token",
    "$ krane secrets add <deployment> -k TOKEN -v super-secret-token",
    "$ krane secrets delete <deployment> --key TOKEN",
    "$ krane secrets delete <deployment> -k TOKEN",
  ];

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
      options: ["add", "delete", "list", "ls"],
      required: true,
    },
    {
      name: "deployment",
      description: "Deployment name",
      required: true,
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
      case "ls":
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
        \nFor more details on configuring secrets checkout: \nhttps://docs.krane.sh/#/deployment-configuration?id=secrets`
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
    const client = await this.getKraneClient();

    let secrets: Secret[];
    try {
      secrets = await client.getSecrets(deploymentName);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to list secrets");
    }

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
  }
}
