import { Command } from "@oclif/command";
import { IConfig } from "@oclif/config";

import { KraneClient } from "@krane/common";
import { AppContext, createAppContext } from "../context/Context";

// Base OCLIF command for interacting with Krane
export default abstract class BaseCommand extends Command {
  protected ctx: AppContext;

  constructor(argv: string[], config: IConfig) {
    super(argv, config);
    this.ctx = createAppContext();
  }

  async getClient() {
    await this.ctx.init();
    if (this.ctx.serverEndpoint == "") {
      throw new Error("Krane endpoint required");
    }
    return new KraneClient(
      this.ctx.serverEndpoint,
      this.ctx.authState.getTokenInfo().token
    );
  }

  async run() {
    throw new Error("Command not implemented");
  }
}
