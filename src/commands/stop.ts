import BaseCommand from "../base";

export default class Stop extends BaseCommand {
  static description = "Stop all containers for a deployment";

  static args = [
    {
      name: "deployment",
      description: "Name of the deployment",
      required: true,
    },
  ];

  async run() {
    const { args } = this.parse(Stop);

    const client = await this.getKraneClient();

    try {
      await client.stopDeployment(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to stop deployment");
    }
  }
}
