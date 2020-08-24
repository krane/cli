import { Command } from "@oclif/command";
import { createAppContext } from "../Context";
import { KraneApiClient } from "../KraneApiClient";
import { ApiClient } from "../ApiClient";

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

    const apiClient: ApiClient = new KraneApiClient(
      this.ctx.serverEnpoint,
      token
    );

    try {
      const deployment = await apiClient.getDeployment(args.deployment);
      if (deployment == null) {
        this.error("Deployment does not exist");
      }
    } catch (e) {
      this.error("Deployment does not exist", e);
    }

    await apiClient.deleteDeployment(args.deployment);
  }
}
