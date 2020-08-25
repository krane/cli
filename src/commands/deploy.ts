import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { KraneApiClient } from "../KraneApiClient";
import { createAppContext } from "../Context";
import { Spec } from "../types/Spec";
import { ApiClient } from "../ApiClient";
import { JsonSerializer } from "../serializer/JsonSerializer";
const readFile = util.promisify(fs.readFile);

export default class Deploy extends Command {
  ctx = createAppContext();

  static description = "Deploy a spec";

  static flags = {
    tag: flags.string({ char: "t" }), // --tag or -t
    file: flags.string({ char: "f" }), // --file or -f
  };

  async run() {
    await this.ctx.init();
    const { flags } = this.parse(Deploy);

    const endpoint = this.ctx.serverEndpoint;
    const { token } = this.ctx.authState.getTokenInfo();

    const kraneClient: ApiClient = new KraneApiClient(endpoint, token);

    const projectSpec = await this.loadKraneSpec(flags.file);

    try {
      if (flags.tag) {
        projectSpec.config.tag = flags.tag;
      }

      const deployment = await kraneClient.applySpec(projectSpec);

      await kraneClient.runDeployment(deployment.name, deployment.config.tag);
    } catch (e) {
      this.error(e);
    }
  }

  private async loadKraneSpec(pathToSpec?: string): Promise<Spec> {
    if (!pathToSpec) {
      const appPath = path.resolve(".");
      pathToSpec = path.resolve(appPath, "krane.json");
    }
    const contents = await (await readFile(pathToSpec)).toString();
    return new JsonSerializer<Spec>().serialize(contents);
  }
}
