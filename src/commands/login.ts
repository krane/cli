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

export default class Login extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(Login);

    const endpoint = "http://localhost:8080";
    const kraneClient = createClient(endpoint);

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
    ]);

    const selectedPk = responses.key;
    const pkPath = path.resolve(path.join(sshDir), selectedPk);
    const pk = await readFile(pkPath);

    const signedPhrase = jwt.sign({ phrase: phrase }, pk, {
      algorithm: "RS256",
    });

    const response = await kraneClient.auth(request_id, signedPhrase);
    this.log(`${response}`)
    this.log("Token expires at: ", response.expires_at);
    this.log(response.token)

    // TODO: Store token

    // const name: string = await cli.prompt("What is your name?");

    // if (args.file && flags.force) {
    //   this.log(`you input --force and --file: ${args.file}`);
    // }
  }
}
