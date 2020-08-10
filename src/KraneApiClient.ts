import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiClient, Session } from "./ApiClient";

export class KraneApiClient extends ApiClient {
  client: AxiosInstance;

  constructor(endpoint: string, token?: string) {
    super();
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
      .then((res) => res.data)
      .catch((e: AxiosError) => {
        throw new Error(e.response?.data?.data);
      });
  }

  async auth(request_id: string, token: string) {
    return this.client
      .post<AuthPostResponse>("/auth", { request_id, token })
      .then((res) => res.data)
      .then((res) => res.data)
      .catch((e: AxiosError) => {
        throw new Error(e.response?.data?.data);
      });
  }

  async createSpec(spec: KraneProjectSpec) {
    return this.client
      .post<CreateDeploymentReponse>(`/spec`, spec)
      .then((res) => res.data)
      .then((res) => res.data)
      .catch((e: AxiosError) => {
        throw new Error(e.response?.data?.data);
      });
  }

  async runDeployment(deploymentName: string, tag: string = "latest") {
    return this.client
      .post(`/deployments/${deploymentName}?tag=${tag}`)
      .then((res) =>
        res.status != 201 ? new Error("Unable to run deployment") : null
      );
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
  data: Session;
  success: boolean;
}

interface CreateDeploymentReponse {
  code: number;
  data: KraneProjectSpec;
  success: boolean;
}

interface ProjectSpecConfig {
  registry?: string;
  container_port?: string;
  host_post?: string;
  image: string;
  tag: string;
  env: { [key: string]: string };
  volumes: { [key: string]: string };
}

export interface KraneProjectSpec {
  name: string;
  config: ProjectSpecConfig;
  updated_at: string;
  created_at: string;
}
