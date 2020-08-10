import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { KraneProjectSpec, KraneApiClient } from "../KraneApiClient";
import { createAppContext } from "../Context";
const readFile = util.promisify(fs.readFile);

export default class Deploy extends Command {
  ctx = createAppContext();

  static description = "Deploy a spec";

  static flags = {
    tag: flags.string(),
    file: flags.string(),
  };

  async run() {
    await this.ctx.init();
    const { flags } = this.parse(Deploy);

    const endpoint = this.ctx.serverEnpoint;
    const { token } = this.ctx.authState.getTokenInfo();

    const kraneClient = new KraneApiClient(endpoint, token);

    const projectSpec = await this.loadKraneSpec(flags.file);

    try {
      if (flags.tag) {
        projectSpec.config.tag = flags.tag;
      }

      cli.action.start("Applying Spec");
      const deployment = await kraneClient.createSpec(projectSpec);
      cli.action.stop();

      cli.action.start("Queuing deployment");
      await kraneClient.runDeployment(deployment.name);
      cli.action.stop();
    } catch (e) {
      this.error(e);
    }
  }

  private async loadKraneSpec(pathToSpec?: string): Promise<KraneProjectSpec> {
    if (!pathToSpec) {
      const appPath = path.resolve(".");
      pathToSpec = path.resolve(appPath, "krane.json");
    }
    const contents = await (await readFile(pathToSpec)).toString();
    return JSON.parse(contents);
  }
}
