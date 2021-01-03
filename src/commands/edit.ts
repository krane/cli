import * as path from "path";
import * as fs from "fs";

import { promisify } from "util";
import { spawn, SpawnOptions } from "child_process";

import { Config } from "@krane/common";

import BaseCommand from "../base";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.unlink);

export default class Edit extends BaseCommand {
  private editor = process.env.EDITOR || "vim";

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

    const client = await this.getKraneClient();

    let config: Config;
    try {
      config = await client.getDeployment(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable edit deployment");
    }

    const filepath = await this.save(config);

    const options: SpawnOptions = { stdio: "inherit" };
    const proc = spawn(this.editor, [filepath], options);

    proc.on("exit", async () => {
      const rawConfig = await readFile(filepath, "utf8");
      const parsedConfig = JSON.parse(rawConfig) as Config;
      await client.saveDeployment(parsedConfig);
      await client.runDeployment(parsedConfig.name);
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
