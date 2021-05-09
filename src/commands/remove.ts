import BaseCommand from "../base";

export default class Remove extends BaseCommand {
  static description = "Remove a deployment and its resources";

  static aliases = ["rm"];

  static args = [
    {
      name: "deployment",
      description: "Name of the deployment",
      required: true,
    },
  ];

  async run() {
    const { args } = this.parse(Remove);

    const client = await this.getKraneClient();

    try {
      await client.deleteDeployment(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable delete deployment");
    }
  }
}
