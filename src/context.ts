import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";
const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const open = promisify(fs.open);
import { memoize } from "lodash";

export interface AppConfig {
  sshDir: string;
  dotConfigDir: string;
}

export function createAppConfig(userConfig?: Partial<AppConfig>): AppConfig {
  return {
    sshDir: path.resolve(os.homedir(), ".ssh"),
    dotConfigDir: path.resolve(os.homedir(), ".krane"),
    ...userConfig,
  };
}

type AuthStateParams = {
  token?: string;
  tokenExpiry?: Date;
};
export class AuthState {
  constructor(private token?: string, private tokenExpiry?: Date) {}

  init({ token, tokenExpiry }: AuthStateParams) {
    this.token = token;
    this.tokenExpiry = tokenExpiry;
  }

  getTokenInfo() {
    return {
      token: this.token,
      tokenExpiry: this.tokenExpiry,
    };
  }

  setTokenInfo(token: string, tokenExpiry: Date) {
    this.token = token;
    this.tokenExpiry = tokenExpiry;
  }

  hasValidToken() {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }

    if (this.tokenExpiry < new Date()) {
      return false;
    }

    return true;
  }
}

export const createAuthState = memoize(() => new AuthState());

abstract class FileStore<T> {
  constructor(private dbPath: string) {}

  get filePath() {
    return path.resolve(this.dbPath);
  }

  async save(data: T) {
    const serialized = await this.serialize(data);
    await writeFile(this.filePath, serialized, "utf8");
  }

  async ensureStoreExist() {
    await open(this.filePath, fs.constants.O_CREAT);
  }

  async get() {
    await this.ensureStoreExist();
    const fCont = await readFile(this.filePath, "utf8");
    return this.parse(fCont);
  }

  abstract async parse(data: string): Promise<T>;
  abstract async serialize(data: T): Promise<string>;
}

export interface KraneState {
  token?: string;
  tokenExpiry?: Date;
  endpoint?: string;
}

class KraneStore extends FileStore<KraneState> {
  async parse(data: string): Promise<KraneState> {
    if (!data) {
      return {
        endpoint: undefined,
        token: undefined,
        tokenExpiry: undefined,
      };
    }

    const p = JSON.parse(data) as KraneState;

    return {
      endpoint: p.endpoint,
      token: p.token,
      tokenExpiry: p.tokenExpiry,
    };
  }

  async serialize(data: KraneState): Promise<string> {
    return JSON.stringify(data, null, 2);
  }
}

export class AppContext {
  private store: KraneStore;
  private storeName = "krane-cli-db";
  private endpoint: string | undefined;

  appConfig: AppConfig = createAppConfig();
  authState = createAuthState();

  get serverEnpoint() {
    if (this.endpoint) {
      return this.endpoint;
    }

    return "";
  }

  constructor() {
    this.store = new KraneStore(
      path.resolve(this.appConfig.dotConfigDir, this.storeName)
    );
  }

  setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
  }

  async init() {
    const { endpoint, token, tokenExpiry } = await this.store.get();

    this.endpoint = endpoint;

    this.authState.init({
      token: token,
      tokenExpiry: tokenExpiry,
    });
  }

  async save() {
    const ctx = await this.store.get();

    if (this.endpoint) {
      ctx.endpoint = this.endpoint;
    }

    const { token, tokenExpiry } = this.authState.getTokenInfo();

    if (token && tokenExpiry) {
      ctx.token = token;
      ctx.tokenExpiry = tokenExpiry;
    }
    await this.store.save(ctx);
  }
}

export const createAppContext = memoize(() => new AppContext());
