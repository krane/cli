import * as util from "util";
import * as dns from "dns";

import { cli } from "cli-ux";
import BaseCommand from "../base";
import { Deployment } from "@krane/common";

const lookup = util.promisify(dns.lookup);

export default class DNS extends BaseCommand {
  static description = `List all of the DNS aliases used by your deployments`;

  static examples = ["$ krane dns", "$ krane dns <deployment>"];

  static args = [
    {
      name: "deployment",
      description: "Name of the deployment",
      required: false,
    },
  ];

  async run() {
    const { args } = this.parse(DNS);

    const client = await this.getKraneClient();

    let deployments: Deployment[];
    try {
      deployments = await client.getDeployments();
    } catch (e) {
      this.error(e?.response?.data ?? "Unable list DNS aliases");
    }

    if (args.deployment) {
      const deployment = deployments.find(
        (d) => d.config.name == args.deployment
      );

      if (!deployment) {
        this.log(
          `0 aliases found for ${args.deployment}
To configure deployment aliases visit: https://docs.krane.sh/#/docs/deployment?id=alias`
        );
        return;
      }

      this.printDNSAliasesForDeployments([deployment]);
      return;
    }

    this.printDNSAliasesForDeployments(deployments);
  }

  async printDNSAliasesForDeployments(deployments: Deployment[]) {
    const aliases = await deployments
      .map((deployment) => deployment.config.alias)
      .flat();

    const aliasesToIpList = aliases.map(async (alias) => ({
      [alias!]: await this.resolveAliasIP(alias!),
    }));

    const aliasesToIpMap = Object.assign(
      {},
      ...(await Promise.all(aliasesToIpList))
    );

    cli.table(deployments, {
      deployment: {
        get: (deployment) => deployment.config.name,
        minWidth: 25,
      },
      alias: {
        get: (deployment) => {
          return deployment.config.alias
            ?.map((alias) => `${alias} (${aliasesToIpMap[alias]})`)
            .join(`\n`);
        },
      },
    });
  }

  async resolveAliasIP(alias: string) {
    try {
      const ip = await lookup(alias);
      return ip.address;
    } catch {
      return "DNS unreachable";
    }
  }
}
