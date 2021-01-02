import BaseCommand from "../base";

export default class Stop extends BaseCommand {
  static description = "Stop containers for a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
  ];

  async run() {
    const { args } = this.parse(Stop);

    try {
      const client = await this.getKraneClient();
      await client.stopDeployment(args.deployment);
    } catch (e) {
      this.error(
        `Unable to stop ${args.deployment} ${e?.response?.data || ""}`
      );
    }
  }
}
