import { Command, flags } from "@oclif/command";
import { createAppContext } from "../Context";
import { KraneApiClient } from "../KraneApiClient";
import { ApiClient } from "../ApiClient";
import { cli } from "cli-ux";

export default class Status extends Command {
  ctx = createAppContext();

  static description = "Get deployment status";

  static args = [{ name: "deployment" }];
  static flags = {
    all: flags.boolean({ char: "a" }), // -a See extra information for all the deployments
    ...cli.table.flags(),
  };

  async run() {
    await this.ctx.init();
    const { args, flags } = this.parse(Status);

    const { token } = this.ctx.authState.getTokenInfo();
    const apiClient: ApiClient = new KraneApiClient(
<<<<<<< HEAD
      this.ctx.serverEndpoint,
=======
      this.ctx.serverEnpoint,
>>>>>>> ea99882bca9921a4acc9190ebe4babd81785dc93
      token
    );
    const deployments = await apiClient.getDeployments();
    cli.table(
      deployments,
      {
        name: {
          get: (deployment) => deployment.spec.name,
          minWidth: 20,
        },

        status: {
          get: (deployment) => deployment.containers[0]?.State ?? "",
          minWidth: 20,
        },
        up: {
          get: (deployment) => deployment.containers.length,
          extended: !flags.all,
          minWidth: 10,
        },
        alias: {
          get: (deployment) => deployment.alias,
          minWidth: 20,
          extended: !flags.all,
        },
        ports: {
          get: (deployment) =>
            deployment.spec.config.host_port +
            ":" +
            deployment.spec.config.container_port,
          minWidth: 20,
          extended: !flags.all,
        },
        image: {
          get: (deployment) => deployment.spec.config.image,
          minWidth: 20,
          extended: !flags.all,
        },
      },
      {
        filter: args?.deployment && `name=${args.deployment}`,
      }
    );
  }
}
