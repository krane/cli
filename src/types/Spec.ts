export interface Spec {
  name: string;
  config: SpecConfig;
  updated_at: string;
  created_at: string;
}

interface SpecConfig {
  registry?: string;
  container_port?: string;
  host_post?: string;
  image: string;
  tag: string;
  env: { [key: string]: string };
  volumes: { [key: string]: string };
}
