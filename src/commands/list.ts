import { Command } from "@oclif/command";
import { cli } from "cli-ux";

import { KraneClient, Config } from "@krane/common";
import { createAppContext } from "./../context/Context";

export default class List extends Command {
  ctx = createAppContext();

  static description = "List deployments";

  static aliases = ["ls"];

  async run() {
    await this.ctx.init();

    const { token } = this.ctx.authState.getTokenInfo();

    const apiClient = new KraneClient(this.ctx.serverEndpoint, token);

    let deployments;
    try {
      deployments = await apiClient.getDeployments();
    } catch (e) {
      this.error("Unable to get deployments");
    }

    cli.table(deployments, {
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
    });
  }
}
