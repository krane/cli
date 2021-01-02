import BaseCommand from "../base";

export default class Restart extends BaseCommand {
  static description = "Restart containers for a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
  ];

  async run() {
    const { args } = this.parse(Restart);

    try {
      const client = await this.getKraneClient();
      await client.restartDeployment(args.deployment);
    } catch (e) {
      this.error(
        `Unable to restart ${args.deployment} ${e?.response?.data || ""}`
      );
    }
  }
}
