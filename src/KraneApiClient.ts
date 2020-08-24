import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiClient, Session } from "./ApiClient";
import { Spec } from "./types/Spec";
import { Deployment } from "./types/Deployment";

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

  async createSpec(spec: Spec) {
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

  async getDeployments() {
    return this.client
      .get<GetDeploymentsResponse>("/deployments")
      .then((res) => res.data)
      .then((res) => res.data)
      .catch((e: AxiosError) => {
        throw new Error(e.response?.data?.data);
      });
  }

  async getDeployment(deploymentName: string) {
    return this.client
      .get<GetDeploymentResponse>(`/deployments/${deploymentName}`)
      .then((res) => res.data)
      .then((res) => res.data)
      .catch((e: AxiosError) => {
        throw new Error(e.response?.data?.data);
      });
  }

  async deleteDeployment(deploymentName: string) {
    return this.client
      .delete(`/deployments/${deploymentName}`)
      .then((res) =>
        res.status != 201 ? new Error("Unable to delete deployment") : null
      )
      .catch((e: AxiosError) => {
        throw new Error(e.response?.data?.data);
      });
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
  data: Spec;
  success: boolean;
}

interface GetDeploymentResponse {
  code: number;
  data: Deployment;
  success: boolean;
}

interface GetDeploymentsResponse {
  code: number;
  data: Deployment[];
  success: boolean;
}
