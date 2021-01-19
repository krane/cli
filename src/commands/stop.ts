import BaseCommand from "../base";

export default class Stop extends BaseCommand {
  static description = "Stop all container for a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
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
