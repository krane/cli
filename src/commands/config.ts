import BaseCommand from "../base";

export default class Config extends BaseCommand {
  static description = "Get the deployment configiguration";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Deployment name",
    },
  ];

  async run() {
    const { args } = this.parse(Config);

    try {
      const client = await this.getClient();
      const config = await client.getDeployment(args.deployment);
      this.log(JSON.parse(JSON.stringify(config)));
    } catch (e) {
      this.error(`Unable to get config for deployment ${args.deployment}`);
    }
  }
}
