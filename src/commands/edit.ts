import * as path from "path";
import * as fs from "fs";
import * as child_process from "child_process";

import { promisify } from "util";
import { Config, KraneClient } from "@krane/common";

import BaseCommand from "../base";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.unlink);

export default class Edit extends BaseCommand {
  private editor = process.env.EDITOR || "vi";

  static description = "Edit a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
  ];

  async run() {
    const { args } = this.parse(Edit);

    let client: KraneClient;
    let deploymentConfig;
    try {
      client = await this.getKraneClient();
      deploymentConfig = await client.getDeployment(args.deployment);
    } catch (e) {
      this.error(`${e}`);
    }

    const filepath = await this.save(deploymentConfig);

    const child = child_process.spawn(this.editor, [filepath], {
      stdio: "inherit",
    });

    child.on("exit", async () => {
      const rawConfig = await readFile(filepath, "utf8");
      const parsedConfig = JSON.parse(rawConfig) as Config;
      await client.applyDeployment(parsedConfig);
      await removeFile(filepath);
    });
  }

  async save(config: Config): Promise<string> {
    const serialized = JSON.stringify(config, null, 2);
    const filepath = path.resolve(
      this.dotConfigDir,
      `${config.name}.deployment.json`
    );

    await writeFile(filepath, serialized, "utf8");
    return filepath;
  }
}
