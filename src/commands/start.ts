import BaseCommand from "../base";

export default class Start extends BaseCommand {
  static description = "Start containers for a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
  ];

  async run() {
    const { args } = this.parse(Start);

    try {
      const client = await this.getKraneClient();
      await client.startDeployment(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to start deployment");
    }
  }
}
