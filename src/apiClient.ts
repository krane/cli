import axios, { AxiosInstance } from "axios";

export function createClient(endpoint: string): KraneAPI {
  return new KraneAPI(endpoint);
}

export class KraneAPI {
  client: AxiosInstance;
  constructor(endpoint: string) {
    this.client = axios.create({
      baseURL: endpoint,
    });
  }

  async deploy(config: KraneProjectSpec) {
    return this.client.post("/deploy", config).then((res) => res.data);
  }

  async login() {
    return this.client
      .get<LoginGetResponse>("/login")
      .then((res) => res.data)
      .then((res) => res.data);
  }

  async auth(request_id: string, token: string) {
    return this.client
      .post<AuthPostResponse>("/login", { request_id, token })
      .then((res) => res.data)
      .then((res) => res.data);
  }
}

interface LoginGetResponse {
  code: number;
  data: {
    request_id: string;
    phrase: string;
  };
  success: boolean;
}

interface AuthPostResponse {
  code: number;
  data: {
    token: string;
    expires_at: string;
  }
  success: boolean;
}

interface ProjectSpecConfig {
  repo: string;
  image: string;
  tag?: string;
}

export interface KraneProjectSpec {
  app: string;
  config: ProjectSpecConfig;
}
