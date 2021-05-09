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
      await client.startDeployment(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to start deployment");
    }
  }
}
