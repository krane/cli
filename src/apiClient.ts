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
