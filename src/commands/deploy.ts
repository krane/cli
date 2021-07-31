import { Config } from "@krane/common";
import { flags } from "@oclif/command";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import BaseCommand from "../base";



const readFile = util.promisify(fs.readFile);

export default class Deploy extends BaseCommand {
  static description = `Create or re-run a deployment
  Check out https://www.krane.sh/#/docs/deployment for additional documentation`;

  static usage = "deploy -f /path/to/deployment.json";

  static examples = ["$ krane deploy -f /path/to/json"];

  static flags = {
    file: flags.string({ char: "f" }), // --file or -f
  };

  async run() {
    const { flags } = this.parse(Deploy);

    const config = await this.loadDeploymentConfig(flags.file);

    if (config.scale == null) {
      config.scale = 1;
    }

    const client = await this.getKraneClient();

    try {
      await client.saveDeployment(config);
      await client.runDeployment(config.name);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable run deployment");
    }
  }

  private async loadDeploymentConfig(pathToConfig?: string): Promise<Config> {
    if (!pathToConfig) {
      const appPath = path.resolve(".");
      pathToConfig = path.resolve(appPath, "deployment.json");
    }

    const contents = await readFile(pathToConfig);
    return JSON.parse(contents.toString()) as Config;
  }
}
