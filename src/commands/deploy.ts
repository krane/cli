import * as fs from "fs";
import * as path from "path";
import * as util from "util";

import { flags } from "@oclif/command";
import { Config } from "@krane/common";

import BaseCommand from "../base";

const readFile = util.promisify(fs.readFile);

export default class Deploy extends BaseCommand {
  static description = "Create a deployment";

  static flags = {
    file: flags.string({ char: "f" }), // --file or -f
    tag: flags.string({ char: "t" }), // --tag or -t
  };

  async run() {
    const { flags } = this.parse(Deploy);

    const config = await this.loadKraneSpec(flags.file);

    try {
      if (flags.tag) {
        config.tag = flags.tag;
      }

      const client = await this.getClient();
      await client.saveDeployment(config);
    } catch (e) {
      this.error(`Unable to apply deployment configuration`);
    }
  }

  private async loadKraneSpec(pathToConfig?: string): Promise<Config> {
    if (!pathToConfig) {
      const appPath = path.resolve(".");
      pathToConfig = path.resolve(appPath, "krane.json");
    }

    const contents = await readFile(pathToConfig);
    return JSON.parse(contents.toString()) as Config;
  }
}
