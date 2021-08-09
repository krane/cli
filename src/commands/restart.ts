import { DeploymentEvent, KraneClient } from "@krane/common";
import { cli } from "cli-ux";
import BaseCommand from "../base";

export default class Restart extends BaseCommand {
  static description = "Restart containers for a deployment";

  static args = [
    {
      name: "deployment",
      description: "Name of the deployment",
      required: true,
    },
  ];

  async run() {
    const { args } = this.parse(Restart);

    const client = await this.getKraneClient();

    try {
      await this.subscribeToDeploymentEvents(args.deployment, client);
      await client.restartDeployment(args.deployment);
    } catch (e) {
      this.error(`Unable to restart ${e?.response?.data || e?.message}`);
    }
  }

  private async subscribeToDeploymentEvents(
    deploymentName: string,
    client: KraneClient
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      client.subscribeToDeploymentEvents({
        deployment: deploymentName,
        onListening: resolve,
        onError: reject,
        eventHandlers: {
          DEPLOYMENT_SETUP: (event: DeploymentEvent) => {
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
          },
          PULL_IMAGE: (event: DeploymentEvent) => {
            // Skip displaying docker pull image
            // metadata events since they are VERY noisy.
            if (event.message.startsWith("{")) return;
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
          },
          CONTAINER_CREATE: (event: DeploymentEvent) => {
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
          },
          CONTAINER_START: (event: DeploymentEvent) => {
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
          },
          DEPLOYMENT_HEALTHCHECK: (event: DeploymentEvent) => {
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
          },
          DEPLOYMENT_CLEANUP: (event: DeploymentEvent) => {
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
          },
          DEPLOYMENT_DONE: (event: DeploymentEvent, stopListening) => {
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
            cli.action.stop();
            stopListening();
          },
          DEPLOYMENT_ERROR: (event: DeploymentEvent, stopListening) => {
            cli.action.stop();
            this.log(
              `\n❌ Failed to restart \`${deploymentName}\`:\n${event.message}\n`
            );
            stopListening();
          },
        },
      });
    });
  }
}
