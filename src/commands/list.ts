import { flags } from "@oclif/command";
import { cli } from "cli-ux";

import BaseCommand from "../base";

export default class List extends BaseCommand {
  static description = "List deployments";

  static aliases = ["ls"];
  static flags = {
    internal: flags.boolean({
      char: "i",
      description: "Display internal deployments",
      default: false,
    }),
  };

  async run() {
    const { flags } = this.parse(List);

    let deployments;
    try {
      const client = await this.getKraneClient();
      deployments = await client.getDeployments();
    } catch (e) {
      this.error(`unable to get deployments ${e?.response?.data || ""}`);
    }

    cli.table(
      deployments,
      {
        name: {
          get: (deployment) => deployment.name,
          minWidth: 20,
        },
        image: {
          get: (deployment) => deployment.image,
          minWidth: 30,
        },
        tag: {
          get: (deployment) => deployment.tag,
          minWidth: 20,
        },
        scale: {
          get: (deployment) => deployment.scale,
          minWidth: 10,
        },
        internal: {
          get: (deployment) => deployment.internal,
          extended: true,
        },
      },
      {
        filter: `internal=${flags.internal}`,
        extended: false,
      }
    );
  }
}
