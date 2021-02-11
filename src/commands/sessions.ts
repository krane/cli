import cli from "cli-ux";

import BaseCommand from "../base";
import { Session } from "@krane/common";

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
      required: true,
      options: ["ls", "list", "create", "rm", "remove"],
      description: "[list, create, remove]",
    },
    {
      name: "user",
      required: false,
      description: "name of the session user ",
    },
  ];

  async run() {
    const { args } = this.parse(Sessions);

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
        if (args.user) {
          await this.listOne(args.user);
          return;
        }
        await this.list();
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

  async listOne(user: string) {
    const client = await this.getKraneClient();

    let sessions: Session[];
    try {
      sessions = await client.getSessions();
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to list sessions");
    }

    const userSessions = sessions.filter((s) => user == s.user);

    userSessions.map((session) => {
      this.log("");
      this.log(`User: ${session.user}`);
      this.log(`Expires: ${session.expires_at}`);
      this.log(`Token: ${session.token}`);
      this.log("");
    });
  }

  async list() {
    const client = await this.getKraneClient();

    let sessions: Session[];
    try {
      sessions = await client.getSessions();
    } catch (e) {
      this.error(e?.response?.data ?? "Unable to list sessions");
    }

    const aphabeticSort = (sessions: Session[]) =>
      sessions.sort((a, b) => (a.user < b.user ? -1 : 1));

    cli.table(aphabeticSort(sessions), {
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
    });
  }
}
