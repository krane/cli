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

    let config;
    let containers;
    try {
      const client = await this.getClient();
      config = await client.getDeployment(args.deployment);
      containers = await client.getContainers(args.deployment);
    } catch (e) {
      this.error(`Unable to describe deployment ${args.deployment}`);
    }

    this.log(`Deployment: ${config.name}`);
    this.log(`Aliases: ${config.alias?.map((alias) => `\n- ${alias}`)}`);
    this.log(`Registry: ${config.registry}`);
    this.log(`Image: ${config.image}`);
    this.log(`Tag: ${config.tag}`);
    this.log(`Command: ${config.command}`);
    this.log(`Scale: ${config.scale}`);

    this.log(`Container count: ${containers.length}`);
    for (const container of containers) {
      this.log("\n---");
      this.log(`Container: ${container.name}`);
      this.log(`ContainerId: ${container.id}`);
      this.log(`Status: ${container.status?.toUpperCase()}`);
      this.log(`Image: ${container.image}`);
      this.log(`ImageId: ${container.image_id}`);

      // ports
      const portCount = container.ports.length;
      this.log(
        `Ports(${portCount}): [Host] → [Container]${container.ports.map(
          (port) => `\n- ${port.host_port} → ${port.container_port}`
        )}`
      );

      // volumes
      const volumeCount = container.volumes?.length;
      this.log(
        `Volumes(${volumeCount}): [Host] → [Container]${container.volumes?.map(
          (volume) => `\n- ${volume.host_volume} → ${volume.container_volume}`
        )}`
      );

      // labels
      const labelCount = Object.entries(container.labels).length;
      this.log(
        `Labels(${labelCount}): ${Object.entries(container.labels).map(
          ([key, value]) => `\n- ${key} → ${value}`
        )}`
      );
    }
  }
}
