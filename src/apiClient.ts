import { Deployment } from "./types/Deployment";
import { Spec } from "./types/Spec";

export abstract class ApiClient {
  abstract async login(): Promise<LoginResponse>;
  abstract auth(request_id: string, token: string): Promise<Session>;
  abstract async runDeployment(
    name: string,
    tag: string
  ): Promise<Error | null>;
  abstract async applySpec(spec: Spec): Promise<Spec>;
  abstract async getDeployments(): Promise<Deployment[]>;
  abstract async getDeployment(name: string): Promise<Deployment>;
  abstract async deleteDeployment(name: string): Promise<Error | null>;
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
