import * as fs from "fs";
import * as path from "path";
import * as util from "util";

import { Command, flags } from "@oclif/command";
import { KraneClient, Config } from "@krane/common";

import { createAppContext } from "../context/Context";

const readFile = util.promisify(fs.readFile);

export default class Deploy extends Command {
  ctx = createAppContext();

  static description = "Apply a deployment configuration";

  static flags = {
    tag: flags.string({ char: "t" }), // --tag or -t
    file: flags.string({ char: "f" }), // --file or -f
  };

  async run() {
    await this.ctx.init();
    const { flags } = this.parse(Deploy);

    const endpoint = this.ctx.serverEndpoint;
    const { token } = this.ctx.authState.getTokenInfo();

    const apiClient = new KraneClient(endpoint, token);

    const config = await this.loadKraneSpec(flags.file);

    try {
      if (flags.tag) {
        config.tag = flags.tag;
      }

      await apiClient.saveDeployment(config);
    } catch (e) {
      this.error(
        `Unable to apply deployment configuration, ${e?.response.data?.data}`
      );
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
