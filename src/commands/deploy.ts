import { Command } from "@oclif/command";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { createClient, KraneProjectSpec } from "../apiClient";
const readFile = util.promisify(fs.readFile);

export default class Deploy extends Command {
  static description = "Deploy this app";

  static args = [
    { name: "tag", description: "image tag to deploy", default: "latest" },
  ];

  async run() {
    const endpoint = "localhost:8080";

    const kraneClient = createClient(endpoint);

    const { args } = this.parse(Deploy);

    const appPath = path.resolve(".");
    const configFilePath = path.resolve(appPath, "krane.json");

    const contents = await (await readFile(configFilePath)).toString();
    
    const projectConfig: KraneProjectSpec = JSON.parse(contents);
    projectConfig.config.tag = args.tag;

    let res = await kraneClient.deploy(projectConfig);

    console.log("Deploying ", res);
  }
}
