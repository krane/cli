import { flags } from "@oclif/command";
import BaseCommand from "../base";

export default class Context extends BaseCommand {
  static description = `View or update the context for the Krane instance in use
  This context contains the endpoint and authentication token used by the CLI to request data from Krane.`;

  static aliases = ["ctx"];

  static usage = [
    "context",
    "context --endpoint http://example.com --token XXX ",
  ];

  static flags = {
    endpoint: flags.string({
      char: "e",
      description: "Krane endpoint (ex: https://example.com)",
      required: false,
    }),
    token: flags.string({
      char: "t",
      description: "Krane token used for authentication",
      required: false,
    }),
    unseal: flags.boolean({
      char: "u",
      description:
        "Reveal sensitive information about the current Krane context such as tokens.",
      default: false,
    }),
  };

  async run() {
    await this.ctx.init();
    const { flags } = this.parse(Context);

    if (!flags.endpoint && !flags.token) {
      this.log(`Endpoint: ${this.ctx.serverEndpoint ?? ""}`);
      this.log(
        `Token: ${
          flags.unseal
            ? this.ctx.authState.getTokenInfo().token ?? ""
            : "[hidden]"
        }`
      );
      return;
    }

    if (flags.endpoint) {
      this.ctx.setEndpoint(flags.endpoint);
    }

    if (flags.token) {
      this.ctx.authState.setToken(flags.token);
    }

    await this.ctx.save();
    this.log("Krane context updated succesfully");
  }
}
