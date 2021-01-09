import * as fs from "fs";
import * as path from "path";
import * as util from "util";

import { flags } from "@oclif/command";
import { Config } from "@krane/common";

import BaseCommand from "../base";

const readFile = util.promisify(fs.readFile);

export default class Deploy extends BaseCommand {
  static description = "Create or run a deployment";

  static flags = {
    file: flags.string({ char: "f" }), // --file or -f
    tag: flags.string({ char: "t" }), // --tag or -t
    scale: flags.string({ char: "s" }), // --scale or -s
  };

  async run() {
    const { flags } = this.parse(Deploy);

    const config = await this.loadDeploymentConfig(flags.file);

    if (flags.tag) {
      config.tag = flags.tag;
    }

    if (flags.scale) {
      config.scale = parseInt(flags.scale);
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

  private async loadDeploymentConfig(pathToConfig?: string): Promise<Config> {
    if (!pathToConfig) {
      const appPath = path.resolve(".");
      pathToConfig = path.resolve(appPath, "deployment.json");
    }

    const contents = await readFile(pathToConfig);
    return JSON.parse(contents.toString()) as Config;
  }
}
