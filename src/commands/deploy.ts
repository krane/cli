import * as fs from "fs";
import * as path from "path";
import * as util from "util";

import { Command, flags } from "@oclif/command";
import { KraneClient, Config } from "@krane/common";

import { createAppContext } from "../context/Context";
import { JsonSerializer } from "../serializer/JsonSerializer";

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

    const projectConfig = await this.loadKraneSpec(flags.file);

    try {
      if (flags.tag) {
        projectConfig.tag = flags.tag;
      }

      await apiClient.saveDeployment(projectConfig);
      this.log("Succesfully applied deployment configuration");
    } catch (e) {
      this.error("Unable to apply deployment configuration");
    }
  }

  private async loadKraneSpec(pathToSpec?: string): Promise<Config> {
    if (!pathToSpec) {
      const appPath = path.resolve(".");
      pathToSpec = path.resolve(appPath, "krane.json");
    }

    const contents = await readFile(pathToSpec);
    return new JsonSerializer<Config>().serialize(contents);
  }
}
