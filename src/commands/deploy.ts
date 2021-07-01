import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import cli from "cli-ux";

import { flags } from "@oclif/command";
import { Config, DeploymentEvent, KraneClient } from "@krane/common";

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
    client.subscribeToDeploymentEvents(config.name, {
      DEPLOYMENT_SETUP: (event: DeploymentEvent) => {
        cli.action.stop();
        cli.action.start(`→ ${event.message}`);
      },

      DEPLOYMENT_PULL_IMAGE: (event: DeploymentEvent) => {
        // Skip displaying docker pull image
        // metadata events since they are VERY noisy.
        if (event.message.startsWith("{")) {
          return;
        }

        cli.action.stop();
        cli.action.start(`→ ${event.message}`);
      },

      DEPLOYMENT_CONTAINER_CREATE: (event: DeploymentEvent) => {
        cli.action.stop();
        cli.action.start(`→ ${event.message}`);
      },

      DEPLOYMENT_CONTAINER_START: (event: DeploymentEvent) => {
        cli.action.stop();
        cli.action.start(`→ ${event.message}`);
      },

      DEPLOYMENT_HEALTHCHECK: (event: DeploymentEvent) => {
        cli.action.stop();
        cli.action.start(`→ ${event.message}`);
      },

      DEPLOYMENT_CLEANUP: (event: DeploymentEvent) => {
        cli.action.stop();
        cli.action.start(`→ ${event.message}`);
      },

      DEPLOYMENT_DONE: (event: DeploymentEvent, stopListening) => {
        cli.action.stop();
        cli.action.start(`→ ${event.message}`);
        cli.action.stop();

        const deploymentURLs = config.alias
          ?.map((url) => (config.secure ? `https://${url}` : `http://${url}`))
          .join("\n🔗 ") ?? [
          "Visit https://krane.sh to learn how to configure a deployment alias",
        ];
        this.log(
          `\n✅ \`${config.name}\` was succesfully deployed to:\n🔗 ${deploymentURLs}
            \nTo view the status of \`${config.name}\` run:\n$ krane status ${config.name}`
        );
        stopListening();
      },

      DEPLOYMENT_ERROR: (event: DeploymentEvent, stopListening) => {
        cli.action.stop();
        this.log(
          `\n✕ Failed to deploy \`${config.name}\`:\n${event.message}\n`
        );
        stopListening();
      },
    });
  }
}
