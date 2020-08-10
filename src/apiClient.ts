import { KraneProjectSpec } from "./KraneApiClient";

export abstract class ApiClient {
  abstract async login(): Promise<LoginResponse>;
  abstract auth(request_id: string, token: string): Promise<Session>;
  abstract async runDeployment(
    name: string,
    tag: string
  ): Promise<Error | null>;
  abstract async createSpec(spec: KraneProjectSpec): Promise<KraneProjectSpec>;
}

export interface LoginResponse {
  request_id: string;
  phrase: string;
}

export interface Session {
  id: string;
  token: string;
  expires_at: string;
}
