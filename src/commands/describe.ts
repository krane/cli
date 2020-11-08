import { cli } from "cli-ux";

import BaseCommand from "../base";

export default class Describe extends BaseCommand {
  static description = "Describe a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
  ];

  async run() {
    await this.ctx.init();
    const { args } = this.parse(Describe);

    let containers;
    try {
      const client = await this.getClient();
      containers = await client.getContainers(args.deployment);
    } catch (e) {
      this.error(`Unable to describe deployment ${args.deployment}`);
    }

    cli.table(containers, {
      status: {
        get: (container) => container.status,
      },
      container: {
        get: (container) => container.name.replace("/", ""),
      },
      image: {
        get: (container) => container.image,
      },
      labels: {
        get: (container) =>
          Object.entries(container.labels)
            .map(([key, value]) => `${key}=${value}`)
            .reduce((prevLabels, label) => `${prevLabels}\n${label}`),
      },
    });
  }
}
