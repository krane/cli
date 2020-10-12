import { Command } from "@oclif/command";
import { KraneClient } from "@krane/common";
import { cli } from "cli-ux";

import { createAppContext } from "./../context/Context";

export default class List extends Command {
  ctx = createAppContext();

  static description = "List deployments";

  static aliases = ["ls"];

  async run() {
    await this.ctx.init();

    const { token } = this.ctx.authState.getTokenInfo();

    const apiClient = new KraneClient(this.ctx.serverEndpoint, token);

    const deployments = await apiClient.getDeployments();

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
