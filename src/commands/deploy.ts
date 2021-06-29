import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import cli from "cli-ux";

import { flags } from "@oclif/command";
import { Config, KraneClient } from "@krane/common";

import BaseCommand from "../base";

const readFile = util.promisify(fs.readFile);

type DeploymentEvent = {
  job_id: string;
  deployment: string;
  type:
    | "DEPLOYMENT_SETUP"
    | "DEPLOYMENT_HEALTHCHECK"
    | "DEPLOYMENT_CLEANUP"
    | "DEPLOYMENT_DONE"
    | "PULL_IMAGE"
    | "CREATE_CONTAINER"
    | "START_CONTAINER"
    | "ERROR";
  message: string;
};

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

    try {
      this.subscribeToDeploymentEvents(config, client);
      await client.saveDeployment(config);
      await client.runDeployment(config.name);
    } catch (e) {
      this.error(e?.response?.data ?? "Error running deployment");
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

  private async subscribeToDeploymentEvents(
    config: Config,
    client: KraneClient
  ): Promise<void> {
    const socket = client.subscribeToDeploymentEvents(config.name);

    socket.onerror = (_event: Event) => {
      if (cli.action.running) cli.action.stop();
      this.log(
        `Encountered an unexpected error when deploying \`${config.name}\``
      );
      socket.close(1000);
    };

    socket.onmessage = (event: MessageEvent) => {
      const { message, type } = JSON.parse(event.data) as DeploymentEvent;

      if (cli.action.running) cli.action.stop();

      switch (type) {
        case "ERROR": {
          this.log(`\n✕ Failed to deploy \`${config.name}\`:\n${message}\n`);
          socket.close(1000);
          break;
        }
        case "DEPLOYMENT_DONE": {
          cli.action.start(`→ ${message}`);
          cli.action.stop();

          const deployedAliases = config.alias?.join("\n🔗 ") ?? [
            "Visit https://krane.sh to learn how to configure a deployment alias",
          ];

          this.log(`
✅ \`${config.name}\` was succesfully deployed to:
🔗 ${deployedAliases}

To view the status of \`${config.name}\` run:
$ krane status ${config.name}`);

          socket.close(1000);
          break;
        }
        case "PULL_IMAGE": {
          // We omit the pull image events that
          // are objects because those  are Docker
          // specific and are VERY noisy.
          if (message.startsWith("{")) {
            break;
          }

          cli.action.start(`→ ${message}`);
          break;
        }
        default: {
          cli.action.start(`→ ${message}`);
          break;
        }
      }
    };
  }
}
