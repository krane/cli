import { Command } from "@oclif/command";
import cli from "cli-ux";

import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";

import * as jwt from "jsonwebtoken";
import * as inquirer from "inquirer";

import { KraneClient } from "@krane/common";
import { KraneStore } from "../store/KraneStore";

import { createAppContext } from "../context/Context";

const readFile = promisify(fs.readFile);

export default class Login extends Command {
  ctx = createAppContext();

  static description = "Authenticate to a Krane server";

  static args = [{ name: "endpoint" }];

  async run() {
    await this.ctx.init();
    const { args } = this.parse(Login);

    let endpoint = args.endpoint;
    if (!endpoint) {
      endpoint = await cli.prompt(
        "What is the endpoint to your Krane instance?",
        { required: true }
      );
    }

    this.ctx.setEndpoint(endpoint);
    await this.ctx.save();

    const apiClient = new KraneClient(this.ctx.serverEndpoint);

    try {
      const { request_id, phrase: serverPhrase } = await apiClient.login();

      const { key, passphrase } = await this.getPrivateKeyAndPhrase();
      const signedServerPhrase = await this.getSignedPhrase(
        key, // private key
        passphrase, // private key password
        serverPhrase // The phrase that will be encrypted with the selected private key and passphrase
      );

      const { expires_at, token, principal } = await apiClient.auth(
        request_id,
        signedServerPhrase
      );

      const tokenExpiration = new Date(Date.parse(expires_at));
      this.ctx.authState.setTokenInfo(token, tokenExpiration, principal);
      this.ctx.save();

      this.log(`Succesfully authenticated with ${this.ctx.serverEndpoint}`);
    } catch (e) {
      this.log(`Unable to authenticate with ${this.ctx.serverEndpoint}`);
    }
  }

  private async getPrivateKeyAndPhrase() {
    const sshDir = this.ctx.appConfig.sshDir;
    let privateKeys = await KraneStore.getPrivateKeys(sshDir);
    const keyChoices = privateKeys.map((key) => ({ name: key }));

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
    return responses;
  }

  private async getSignedPhrase(
    privateKeyFileName: string,
    privateKeyPassphrase: string,
    serverPhrase: string
  ) {
    const pkPath = path.resolve(
      path.join(this.ctx.appConfig.sshDir),
      privateKeyFileName
    );
    const privateKey = await readFile(pkPath);

    // Sign the server phrase with client private key
    try {
      return this.signServerPhraseWithPK(
        privateKey,
        privateKeyPassphrase,
        serverPhrase
      );
    } catch (e) {
      this.error("Invalid key/passphrase combination");
    }
  }

  private signServerPhraseWithPK(
    privateKey: Buffer,
    privateKeyPassword: string,
    phrase: string
  ): string {
    try {
      return jwt.sign(
        { phrase: phrase },
        { key: privateKey, passphrase: privateKeyPassword },
        {
          algorithm: "RS256",
        }
      );
    } catch (e) {
      throw new Error("Invalid key/passphrase combination");
    }
  }
}
