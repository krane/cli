import * as fs from "fs";
import { promisify } from "util";

import { FileStore } from "./FileStore";
import { KraneState } from "../context/Context";

const readDir = promisify(fs.readdir);

export class KraneStore extends FileStore<KraneState> {
  async parse(data: string): Promise<KraneState> {
    if (!data) {
      return {
        user: undefined,
        endpoint: undefined,
        token: undefined,
        tokenExpiry: undefined,
      };
    }

    const p = JSON.parse(data) as KraneState;

    return {
      user: p.user,
      endpoint: p.endpoint,
      token: p.token,
      tokenExpiry: p.tokenExpiry,
    };
  }

  async serialize(data: KraneState): Promise<string> {
    return JSON.stringify(data, null, 2);
  }

  static async getPrivateKeys(sshDir: string) {
    const filterOut = ["authorized_keys", "config", "known_hosts"];

    const allFiles = await readDir(sshDir);
    return allFiles
      .filter((f) => !f.endsWith(".pub"))
      .filter((f) => !filterOut.includes(f));
  }
}
