import {
  Config,
  Deployment,
  DeploymentEvent,
  KraneClient,
} from "@krane/common";
import { flags } from "@oclif/command";
import { spawn, SpawnOptions } from "child_process";
import { cli } from "cli-ux";
import * as fs from "fs";
import { isEqual } from "lodash";
import * as path from "path";
import { promisify } from "util";
import BaseCommand from "../base";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.unlink);

export default class Edit extends BaseCommand {
  private editor = process.env.EDITOR || "vim";

  static description = `Edit a deployments configuration
  Check out https://www.krane.sh/#/docs/deployment for additional documentation`;

  static usage = "edit <my-deployment>";

  static args = [
    {
      name: "deployment",
      description: "Name of the deployment",
      required: true,
    },
  ];

  static flags = {
    output: flags.string({
      char: "o",
      description:
        "Filepath where the updated deployment configuration will be saved to",
    }),
  };

  async run() {
    const { args, flags } = this.parse(Edit);

    const client = await this.getKraneClient();

    let deployment: Deployment;
    try {
      deployment = await client.getDeployment(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable edit deployment");
    }

    // save a temporary copy on the host to allow editing on an editor
    const filepath = await this.save(deployment.config);

    const options: SpawnOptions = { stdio: "inherit" };
    const proc = spawn(this.editor, [filepath], options);

    proc.on("exit", async () => {
      const rawConfig = await readFile(filepath, "utf8");
      const parsedConfig = JSON.parse(rawConfig) as Config;
      await removeFile(filepath);

      if (isEqual(parsedConfig, deployment.config)) {
        this.log("Deployment configuration unchanged. Nothing to do.");
        return;
      }

      this.log("→ Deployment configuration updated... done");
      this.log("→ Triggering new deployment... done");

      try {
        await client.saveDeployment(parsedConfig);
        await this.subscribeToDeploymentEvents(parsedConfig, client);
        await client.runDeployment(parsedConfig.name);
      } catch (e) {
        this.error(
          `Unable to edit deployment ${e?.response?.data || e?.message}`
        );
      }

      if (flags.output) {
        await this.save(parsedConfig, flags.output);
        this.log(`→ Configuration saved to "${flags.output}"`);
      }
    });
  }

  async save(config: Config, filepath?: string): Promise<string> {
    // default to ~/.krane dir. if no output filepath was specified,
    if (!filepath) {
      filepath = path.resolve(
        this.dotConfigDir,
        `${config.name}.deployment.json`
      );
    }

    const serialized = JSON.stringify(config, null, 2);
    await writeFile(filepath, serialized, "utf8");
    return filepath;
  }

  private async subscribeToDeploymentEvents(
    config: Config,
    client: KraneClient
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      client.subscribeToDeploymentEvents({
        deployment: config.name,
        onListening: resolve,
        onError: reject,
        eventHandlers: {
          DEPLOYMENT_SETUP: (event: DeploymentEvent) => {
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
          },
          PULL_IMAGE: (event: DeploymentEvent) => {
            // Skip displaying docker pull image
            // metadata events since they are VERY noisy.
            if (event.message.startsWith("{")) return;
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
          },
          CONTAINER_CREATE: (event: DeploymentEvent) => {
            cli.action.stop();
            cli.action.start(`→ ${event.message}`);
          },
          CONTAINER_START: (event: DeploymentEvent) => {
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
            this.log(`\n✅ \`${config.name}\` was succesfully updated.`);
            stopListening();
          },
          DEPLOYMENT_ERROR: (event: DeploymentEvent, stopListening) => {
            cli.action.stop();
            this.log(
              `\n❌ Failed to deploy \`${config.name}\`:\n${event.message}\n`
            );
            stopListening();
          },
        },
      });
    });
  }
}
