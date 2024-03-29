import cli from "cli-ux";

import BaseCommand from "../base";
import { Session } from "@krane/common";
import { flags } from "@oclif/command";

export default class Sessions extends BaseCommand {
  static description = "Create, list or remove user sessions";

  static examples = [
    "$ krane sessions ls",
    "$ krane sessions list",
    "$ krane secrets create",
    "$ krane secrets rm my-user",
    "$ krane secrets remove my-user",
  ];

  static args = [
    {
      name: "subcommand",
      description: "[list, create, remove]",
      options: ["ls", "list", "create", "rm", "remove"],
      required: true,
    },
    {
      name: "user",
      description: "name of the session user ",
      required: false,
    },
  ];

  static flags = {
    unseal: flags.boolean({
      char: "u",
      description:
        "Reveal sensitive information about the current Krane context such as tokens",
      default: false,
    }),
  };

  async run() {
    const { args, flags } = this.parse(Sessions);

    switch (args.subcommand) {
      case "create":
        if (!args.user) {
          args.user = await cli.prompt(
            "What should we name this session? For example `bob` or `my-deployment-ci`",
            { required: true }
          );
        }

        await this.create(args.user);
        break;
      case "rm":
      case "remove":
        if (!args.user) {
          args.user = await cli.prompt("Name of the user to create?", {
            required: true,
          });
        }
        await this.remove(args.user);
        break;
      case "ls":
      case "list":
        await this.list(args.user, flags.unseal);
        break;
      default:
        this.error(`Unknown command ${args.subcommand}`);
    }
  }

  async create(user: string) {
    const client = await this.getKraneClient();

    try {
      await client.createSession(user);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to create session");
    }

    this.log(`Succesfully created session for ${user}\n`);
    this.log(`  Run the below command to list details about ${user}'s session`);
    this.log(`  $ krane sessions list ${user}\n`);
  }

  async remove(user: string) {
    const client = await this.getKraneClient();

    const sessions = await client.getSessions();
    const sessionToRemove = sessions.find((s) => user == s.user);
    if (!sessionToRemove) {
      this.error(`Session ${user} not found`);
    }

    try {
      await client.deleteSession(sessionToRemove.id);
      this.log(`Succesfully deleted session for ${user}`);
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to remove session");
    }
  }

  async list(user?: string, unseal: boolean = false) {
    const client = await this.getKraneClient();

    let sessions: Session[];
    try {
      sessions = await client.getSessions();
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to list sessions");
    }

    const aphabeticSort = (sessions: Session[]) =>
      sessions.sort((a, b) => (a.user < b.user ? -1 : 1));

    let filteredSessions = sessions;
    if (user) {
      filteredSessions = sessions.filter((s) => s.user == user);
    }

    cli.table(
      aphabeticSort(filteredSessions),
      {
        user: {
          get: (session) => session.user,
          minWidth: 10,
        },
        active: {
          get: (session) =>
            new Date(0).setHours(0, 0, 0, 0) <=
            new Date(session.expires_at).setHours(0, 0, 0, 0),
          minWidth: 10,
        },
        expires: {
          get: (session) => session.expires_at,
          minWidth: 15,
        },
        token: {
          get: (session) =>
            unseal ? session.token.replace(/.{100}/g, "$&\n") : "[hidden]",
        },
      },
      {
        "no-truncate": true,
      }
    );
  }
}
