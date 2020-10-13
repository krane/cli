import { cli } from "cli-ux";
import { KraneClient } from "@krane/common";
import { createAppContext } from "./../context/Context";
import { Command } from "@oclif/command";

export default class Config extends Command {
  ctx = createAppContext();

  static description = "Get a deployment configuration";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Deployment name",
    },
  ];

  async run() {
    await this.ctx.init();

    const { args } = this.parse(Config);

    const { token } = this.ctx.authState.getTokenInfo();

    const client = new KraneClient(this.ctx.serverEndpoint, token);

    try {
      const config = await client.getDeployment(args.deployment);
      this.log(JSON.parse(JSON.stringify(config)));
    } catch (e) {
      this.log("Unable to get config");
    }
  }
}
