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

    const client = await this.getKraneClient();

    try {
      await client.restartDeployment(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to restart deployment");
    }
  }
}
