import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";
import { createClient } from "../apiClient";
const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
import * as jwt from "jsonwebtoken";
import * as inquirer from "inquirer";
import { createAppContext } from "../context";

export default class Login extends Command {
  ctx = createAppContext();

  static description = "Login to a krane server";

  static args = [{ name: "endpoint" }];

  async run() {
    await this.ctx.init();
    const { args, flags } = this.parse(Login);

    let endpoint = args.endpoint;
    if (!endpoint) {
      endpoint = await cli.prompt(
        "Please specify the url or IP of your krane server",
        {
          required: true,
        }
      );
    }

    this.ctx.setEndpoint(endpoint);
    await this.ctx.save();

    console.log("ctx.serverEndpoint", this.ctx.serverEnpoint);
    console.log("ctx.authState.tokenInfo", this.ctx.authState.getTokenInfo());

    const kraneClient = createClient(this.ctx.serverEnpoint);
    const { phrase, request_id } = await kraneClient.login();

    let privateKeys = [];
    const sshDir = path.join(os.homedir(), ".ssh");
    const allFiles = await readDir(sshDir);

    const filterOut = ["authorized_keys", "config", "known_hosts"];
    privateKeys = allFiles.filter(
      (f) => !f.endsWith(".pub") && !filterOut.includes(f)
    );

    const keyChoices = privateKeys.map((k) => ({
      name: k,
    }));

    let responses = await inquirer.prompt([
      {
        name: "key",
        message: "Select a private key",
        type: "list",
        choices: keyChoices,
      },
      {
        name: "passphrase",
        message: "Key passphrase (Leave empty if not set)",
        type: "password",
      },
    ]);

    const { key: selectedPk, passphrase } = responses;
    const pkPath = path.resolve(path.join(sshDir), selectedPk);
    const pk = await readFile(pkPath);

    const signedPhrase = jwt.sign(
      { phrase: phrase },
      { key: pk, passphrase },
      {
        algorithm: "RS256",
      }
    );

    try {
      const response = await kraneClient.auth(request_id, signedPhrase);
      const token = response.session.token;
      const tokenExpiration = new Date(Date.parse(response.session.expires_at));

      this.ctx.authState.setTokenInfo(token, tokenExpiration);
      await this.ctx.save();
    } catch (e) {
      if (e.response) {
        this.log(e.response.data);
        this.error(e);
      }
      this.log("Unable to authenticate");
      this.log(e);
    }

    await this.ctx.save();

    this.log("token", this.ctx.authState.getTokenInfo().token);
    this.log("tokenExpiry", this.ctx.authState.getTokenInfo().tokenExpiry);
  }
}
