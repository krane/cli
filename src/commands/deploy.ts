import { Command } from "@oclif/command";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { createClient, KraneProjectSpec } from "../apiClient";
import { createAppContext } from "../context";
const readFile = util.promisify(fs.readFile);

export default class Deploy extends Command {
  ctx = createAppContext();

  static description = "Deploy this app";

  static args = [
    { name: "tag", description: "image tag to deploy", default: "latest" },
  ];

  async run() {
    await this.ctx.init();

    const endpoint = this.ctx.serverEnpoint;
    const { token } = this.ctx.authState.getTokenInfo();

    const kraneClient = createClient(endpoint, token);

    const { args } = this.parse(Deploy);

    const appPath = path.resolve(".");
    const configFilePath = path.resolve(appPath, "krane.json");

    const contents = await (await readFile(configFilePath)).toString();

    const projectConfig: KraneProjectSpec = JSON.parse(contents);

    const deployment = await kraneClient.createDeployment(projectConfig);

    this.log("Created Deployment", deployment.data.name);
    this.log("With Image", deployment.data.config.image);

    try {
      await kraneClient.runDeployment(deployment.data.name);
      this.log("Running app...");
    } catch (err) {
      console.error(err);
      this.error(err.message);
    }
  }
}
