import { DeploymentEvent, KraneClient } from "@krane/common";
import cli from "cli-ux";
import BaseCommand from "../base";
export default class Remove extends BaseCommand {
  static description = "Remove a deployment and its resources";

  static aliases = ["rm"];

  static args = [
    {
      name: "deployment",
      description: "Name of the deployment",
      required: true,
    },
  ];

  async run() {
    const { args } = this.parse(Remove);

    const client = await this.getKraneClient();

    try {
      this.subscribeToDeploymentEvents(args.deployment, client);
      await client.deleteDeployment(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable delete deployment");
    }
  }

  private async subscribeToDeploymentEvents(
    deploymentName: string,
    client: KraneClient
  ): Promise<void> {
    client.subscribeToDeploymentEvents(
      deploymentName,
      {
        CONTAINER_REMOVE: (event: DeploymentEvent) => {
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
            `\n✕ Failed to remove \`${deploymentName}\`:\n${event.message}\n`
          );
          stopListening();
        },
      },
      (error: Event) => {
        this.log(
          `\n\n=======================================
          \nError subscribing to deployment events:\n${error}
          \n=======================================\n\n`
        );
      }
    );
  }
}
