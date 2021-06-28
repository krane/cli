import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import cli from "cli-ux";

import { flags } from "@oclif/command";
import { Config } from "@krane/common";

import BaseCommand from "../base";
import { isArguments } from "lodash";

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
    const client = await this.getKraneClient();

    const deploymentEvents = client.subscribeToDeploymentEvents(config.name);
    deploymentEvents.onmessage = (event: MessageEvent) => {
      const { message } = JSON.parse(event.data) as {
        job_id: string;
        message: string;
      };

      if (message.startsWith("{")) {
        return;
      }

      cli.action.stop();
      cli.action.start(message);
    };

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
    const config = JSON.parse(contents.toString()) as Config;

    if (config.scale == null) {
      config.scale = 1;
    }

    return config;
  }
}
