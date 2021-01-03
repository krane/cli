import BaseCommand from "../base";

export default class Logs extends BaseCommand {
  static description = "Stream container logs";

  static args = [
    {
      name: "container",
      required: true,
      description: "Name of the container",
    },
  ];

  async run() {
    const { args } = this.parse(Logs);
    const client = await this.getKraneClient();

    try {
      const socket = client.streamContainerLogs(args.container);
      socket.onmessage = (e: MessageEvent) => this.log(e.data);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to read container logs");
    }
  }
}
