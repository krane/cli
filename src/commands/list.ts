import { flags } from "@oclif/command";
import { cli } from "cli-ux";
import { Deployment } from "@krane/common";

import BaseCommand from "../base";
import { calculateTimeDiff } from "./../utils/time";

export default class List extends BaseCommand {
  static description = "List all deployments";

  static aliases = ["ls"];

  static flags = {
    internal: flags.boolean({
      char: "i",
      description: "Display internal deployments ONLY",
      default: false,
    }),
  };

  async run() {
    const { flags } = this.parse(List);

    const client = await this.getKraneClient();

    let deployments;
    try {
      deployments = await client.getDeployments();
    } catch (e) {
      this.error(e?.response?.data ?? "Unable list deployment");
    }

    const userDeployment = deployments.filter((d) => !d.config.internal);
    if (!flags.internal && userDeployment.length == 0) {
      this.log(`\n  You don't have any active deployments`);
      this.log(
        `\n  Get started by running the command below or checking out https://krane.sh/#/docs/deployment`
      );
      this.log(`  $ krane deploy help\n`);
      return;
    }

    const getLastJob = (dep: Deployment) => dep.jobs[dep.jobs.length - 1];

    cli.table(
      deployments,
      {
        name: {
          get: (deployment) => deployment.config.name,
          minWidth: 10,
        },
        ready: {
          get: (deployment) => {
            const runningContainers = deployment.containers.filter(
              (container) => container.state.running
            );
            return `${runningContainers.length}/${deployment.config.scale}`;
          },
          minWidth: 8,
        },
        updated: {
          get: (deployment) => {
            const latestJob = getLastJob(deployment);
            return `${
              latestJob?.status.failure_count > 0
                ? "with errors"
                : "succesfully"
            } ${calculateTimeDiff(latestJob?.start_time_epoch)}`;
          },
          minWidth: 30,
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

    const firstErrorDeployment = deployments
      .filter((dep) => getLastJob(dep)?.status.failure_count > 0)
      .sort(
        (depA, depB) =>
          getLastJob(depA).start_time_epoch - getLastJob(depB).start_time_epoch
      )[0];

    if (firstErrorDeployment) {
      this.log(
        `\n  To view details about deployments with error's try running this command`
      );
      this.log(`  $ krane history ${firstErrorDeployment.config.name}\n`);
    }
  }
}
