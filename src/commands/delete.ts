import BaseCommand from "../base";

export default class Delete extends BaseCommand {
  static description = "Delete a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
  ];

  async run() {
    const { args } = this.parse(Delete);

    try {
      const client = await this.getKraneClient();
      await client.deleteDeployment(args.deployment);
    } catch (e) {
      this.error(`Unable to delete deployment ${args.deployment}`);
    }
  }
}
