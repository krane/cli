import { Command } from "@oclif/command";
import { KraneClient } from "@krane/common";

import { createAppContext } from "../context/Context";

export default class Delete extends Command {
  ctx = createAppContext();

  static description = "Delete a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
  ];

  async run() {
    await this.ctx.init();

    const { args } = this.parse(Delete);

    const { token } = this.ctx.authState.getTokenInfo();

    const apiClient = new KraneClient(this.ctx.serverEndpoint, token);

    try {
      await apiClient.deleteDeployment(args.deployment);
    } catch (e) {
      this.error("Unable to delete deployment");
    }
  }
}
