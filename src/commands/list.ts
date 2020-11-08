import { cli } from "cli-ux";
import BaseCommand from "../base";

export default class List extends BaseCommand {
  static description = "List deployments";

  static aliases = ["ls"];

  async run() {
    let deployments;
    try {
      const client = await this.getClient();
      deployments = await client.getDeployments();
    } catch (e) {
      this.error(`${e}`);
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
