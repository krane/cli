import { cli } from "cli-ux";
import { Container } from "@krane/common";

import BaseCommand from "../base";

export default class Status extends BaseCommand {
  static description = "Get the status of a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
    {
      name: "container",
      required: false,
      description: "Name of the container",
    },
  ];

  async run() {
    const { args } = this.parse(Status);

    let containers;
    try {
      const client = await this.getKraneClient();
      containers = await client.getContainers(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to describe deployment");
    }

    if (args.container) {
      const filteredContainer = containers.find(
        (container) => container.name == args.container
      );
      if (!filteredContainer) {
        this.error(`Unable to find container ${args.container}`);
      }
      this.logContainerTable(filteredContainer);
      return;
    }

    this.logTable(containers);
  }

  logTable(containers: Container[]) {
    cli.table(containers, {
      status: {
        get: (container) => container.state.status,
        minWidth: 10,
      },
      container: {
        get: (container) => container.name,
        minWidth: 20,
      },
      up: {
        get: (container) => `${this.calculateTimeDiff(container.created_at)}`,
        minWidth: 15,
      },
    });
  }

  logContainerTable(container: Container) {
    this.log(`Status: ${container.state.status.toUpperCase()}`);
    this.log(`Container: ${container.name}`);
    this.log(`ContainerId: ${container.id}`);
    this.log(`Image: ${container.image}`);
    this.log(`ImageId: ${container.image_id}`);
    this.log(`Command: ${container.command ?? ""}`);
    this.log(`Entrypoint: ${container.entrypoint ?? ""}`);

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

  calculateTimeDiff(epoch: number) {
    const diffMs = new Date().valueOf() - new Date(epoch * 1000).valueOf();

    const minutesDiff = Math.floor(diffMs / 1000 / 60);
    const hoursDiff = Math.floor(diffMs / 1000 / 60 / 60);
    const daysDiff = Math.floor(diffMs / 1000 / 60 / 60 / 60);

    if (minutesDiff <= 60) {
      return `${minutesDiff} minute(s) ago`;
    }

    if (hoursDiff <= 24) {
      return `${hoursDiff} hours(s) ago`;
    }

    return `${daysDiff} day(s) ago`;
  }
}
