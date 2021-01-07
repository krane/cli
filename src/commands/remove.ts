import BaseCommand from "../base";

export default class Remove extends BaseCommand {
  static description = "Remove a deployment";

  static aliases = ["rm"];

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
  ];

  async run() {
    const { args } = this.parse(Remove);

    try {
      const client = await this.getKraneClient();
      await client.deleteDeployment(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable delete deployment");
    }
  }
}