import axios, { AxiosInstance } from "axios";

export function createClient(endpoint: string, token?: string): KraneAPI {
  return new KraneAPI(endpoint, token);
}

export class KraneAPI {
  client: AxiosInstance;
  constructor(endpoint: string, token?: string) {
    this.client = axios.create({
      baseURL: endpoint,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async login() {
    return this.client
      .get<LoginGetResponse>("/login")
      .then((res) => res.data)
      .then((res) => res.data);
  }

  async auth(request_id: string, token: string) {
    return this.client
      .post<AuthPostResponse>("/auth", { request_id, token })
      .then((res) => res.data)
      .then((res) => res.data);
  }

  async createDeployment(config: KraneProjectSpec) {
    return this.client
      .post<CreateDeploymentReponse>("/deployments", config)
      .then((res) => res.data);
  }

  async runDeployment(deploymentName: string, tag: string = "latest") {
    return this.client
      .post(`/deployments/${deploymentName}/run?tag=${tag}`)
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
    error: string;
    session: Session;
  };
  success: boolean;
}

interface CreateDeploymentReponse {
  code: number;
  data: KraneProjectSpec;
  success: boolean;
}

interface Session {
  token: string;
  expires_at: string;
  id: string;
}

interface ProjectSpecConfig {
  registry?: string;
  container_port?: string;
  host_post?: string;
  image: string;
}

export interface KraneProjectSpec {
  name: string;
  config: ProjectSpecConfig;
}
