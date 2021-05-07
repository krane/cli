import * as os from "os";
import * as path from "path";
import * as fs from "fs";

import { memoize } from "lodash";
import { AuthState } from "./AuthClient";
import { KraneStore } from "../store/KraneStore";

export const createAppContext = memoize(() => new AppContext());

export function createAppConfig(userConfig?: Partial<AppConfig>): AppConfig {
  return {
    sshDir: path.resolve(os.homedir(), ".ssh"),
    dotConfigDir: path.resolve(os.homedir(), ".krane"),
    ...userConfig,
  };
}

export interface AppConfig {
  sshDir: string;
  dotConfigDir: string;
}

export interface KraneState {
  token?: string;
  tokenExpiry?: Date;
  endpoint?: string;
  user?: string;
}

export class AppContext {
  private store: KraneStore;
  private storeName = "krane.config";
  private endpoint: string | undefined;

  authState: AuthState;
  appConfig: AppConfig = createAppConfig();

  get serverEndpoint() {
    return this.endpoint ?? "";
  }

  constructor() {
    this.authState = new AuthState();

    this.ensureDotConfigDirDirExist();
    const dbPath = path.resolve(this.appConfig.dotConfigDir, this.storeName);
    this.store = new KraneStore(dbPath);
  }

  setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
  }

  ensureDotConfigDirDirExist() {
    fs.exists(this.appConfig.dotConfigDir, (exist) => {
      if (!exist) {
        fs.promises.mkdir(this.appConfig.dotConfigDir, { recursive: true });
      }
    });
  }

  async init() {
    const { endpoint, token, tokenExpiry, user } = await this.store.get();

    this.endpoint = endpoint;

    this.authState.init({
      user: user,
      token: token,
      tokenExpiry: tokenExpiry,
    });
  }

  async save() {
    const ctx = await this.store.get();

    if (this.endpoint) {
      ctx.endpoint = this.endpoint;
    }

    const { token, tokenExpiry, user } = this.authState.getTokenInfo();

    if (token) {
      ctx.token = token;
    }

    if (tokenExpiry) {
      ctx.tokenExpiry = tokenExpiry;
    }

    if (user) {
      ctx.user = user;
    }

    await this.store.save(ctx);
  }
}
