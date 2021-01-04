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
      containers = await client.getDeploymentContainers(args.deployment);
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
      this.logFormattedContainerInfo(filteredContainer);
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
        get: (container) =>
          `${this.minuteDifference(container.created_at)} minute(s) ago`,
        minWidth: 15,
      },
    });
  }

  logFormattedContainerInfo(container: Container) {
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

  minuteDifference(epoch: number): number {
    const diffMs = Math.abs(Date.now() - new Date(epoch * 1000).getTime());
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    return diffMins;
  }

  hourDifference(epoch: number): number {
    const diffMs = Math.abs(Date.now() - new Date(epoch * 1000).getTime());
    return Math.floor((diffMs % 86400000) / 3600000);
  }

  daysDifference(epoch: number): number {
    const diffMs = Math.abs(Date.now() - new Date(epoch * 1000).getTime());
    return Math.floor((diffMs % 86400000) / 3600000);
  }
}
