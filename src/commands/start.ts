import { DeploymentEvent, KraneClient } from "@krane/common";
import { cli } from "cli-ux";
import BaseCommand from "../base";

export default class Start extends BaseCommand {
  static description = "Start all containers for a deployment";

  static args = [
    {
      name: "deployment",
      description: "Name of the deployment",
      required: true,
    },
  ];

  async run() {
    const { args } = this.parse(Start);

    const client = await this.getKraneClient();

    try {
      await this.subscribeToDeploymentEvents(args.deployment, client);
      await client.startDeployment(args.deployment);
    } catch (e) {
      this.error(`Unable to start ${e?.response?.data || e?.message}`);
    }
  }

  private subscribeToDeploymentEvents(
    deploymentName: string,
    client: KraneClient
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      client.subscribeToDeploymentEvents({
        deployment: deploymentName,
        onListening: resolve,
        onError: reject,
        eventHandlers: {
          CONTAINER_START: (event: DeploymentEvent) => {
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
              `\n❌ Failed to start \`${deploymentName}\`:\n${event.message}\n`
            );
            stopListening();
          },
        },
      });
    });
  }
}
