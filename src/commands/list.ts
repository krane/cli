import { flags } from "@oclif/command";
import { cli } from "cli-ux";

import BaseCommand from "../base";
import { calculateTimeDiff } from "./../utils/time";

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
      this.error(e?.response?.data ?? "Unable list deployment");
    }

    cli.table(
      deployments,
      {
        name: {
          get: (deployment) => deployment.config.name,
          minWidth: 10,
        },
        up: {
          get: (deployment) =>
            `${deployment.containers.length}/${deployment.config.scale}`,
          minWidth: 6,
        },
        updated: {
          get: (deployment) => {
            const latestJob = deployment.jobs[deployment.jobs.length - 1];
            return calculateTimeDiff(latestJob.start_time_epoch);
          },
          minWidth: 18,
        },
        secure: {
          get: (deployment) => deployment.config.secure,
          minWidth: 10,
        },
        tag: {
          get: (deployment) => deployment.config.tag,
          minWidth: 10,
        },
        image: {
          get: (deployment) => deployment.config.image,
          minWidth: 20,
        },

        internal: {
          get: (deployment) => deployment.config.internal,
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
