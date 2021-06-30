import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import fetch from "node-fetch";

import { flags } from "@oclif/command";
import { Config } from "@krane/common";

import BaseCommand from "../base";

const readFile = util.promisify(fs.readFile);

export default class Deploy extends BaseCommand {
  static description = `Create or re-run a deployment
  Check out https://www.krane.sh/#/docs/deployment for additional documentation`;

  static usage = "deploy -f /path/to/deployment.json";

  static examples = ["$ krane deploy -f /path/to/json"];

  static flags = {
    file: flags.string({ char: "f" }), // --file or -f
    url: flags.string({ char: "u" }), // --url or -u
  };

  async run() {
    const { flags } = this.parse(Deploy);

    if (flags.file && flags.url) {
      this.error("File and URL flags both provided, please provide only one.");
    }

    let config: Config;

    if (flags.url) {
      config = await fetch(flags.url)
        .then(async (res) => await res.json())
        .catch((e) =>
          this.error(`fetching deployment config from ${flags.url}: ${e}`)
        );
    } else if (flags.file) {
      config = await this.loadDeploymentConfig(flags.file);
    } else {
      const appPath = path.resolve(".");
      const pathToConfig = path.resolve(appPath, "deployment.json");
      this.log(`
A deployment configuration file or URL was not provided, resolving: ${pathToConfig}
\nPlease note: If you would like to point to a custom file or URL where your 
deployment configuration is located try the --file or --url CLI flags.

$ krane deploy --file ./deployment.json\n`);
      config = await this.loadDeploymentConfig(pathToConfig);
    }

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

  private async loadDeploymentConfig(pathToConfig: string): Promise<Config> {
    const contents = await readFile(pathToConfig);
    return JSON.parse(contents.toString()) as Config;
  }
}
