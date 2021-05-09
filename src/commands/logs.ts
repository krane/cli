import { flags } from "@oclif/command";

import BaseCommand from "../base";

export default class Logs extends BaseCommand {
  static description = "Read deployment or container logs";

  static usage = "logs <deployment>";

  static examples = [
    "$ krane logs my-app",
    "$ krane logs my-app --container=my-app-haYADWqwmzY83QuZQfQY3h",
  ];

  static args = [
    {
      name: "deployment",
      description: "Name of the deployment",
      required: true,
    },
  ];

  static flags = {
    container: flags.string({ char: "c" }), // --container or -c
  };

  async run() {
    const { args, flags } = this.parse(Logs);

    const client = await this.getKraneClient();

    let socket: WebSocket;

    try {
      if (flags.container) {
        socket = client.subscribeToContainerLogs(flags.container);
      } else {
        socket = client.subscribeToDeploymentLogs(args.deployment);
      }
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to read deployment logs");
    }

    socket.onmessage = (e: MessageEvent) => this.log(e.data);
  }
}
