import { Command } from "@oclif/command";

export default class Deploy extends Command {
  static description = "Deploy this app";

  static args = [
    { name: "tag", description: "image tag to deploy", default: "latest" },
  ];

  async run() {
    const { args } = this.parse(Deploy);

    // Get krane.json file

    console.log("Deploying " + args.tag);
  }
}
