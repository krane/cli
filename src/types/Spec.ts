<<<<<<< HEAD
import { Serializer } from "../serializer/Serializer";

=======
>>>>>>> ea99882bca9921a4acc9190ebe4babd81785dc93
export interface Spec {
  name: string;
  config: SpecConfig;
  updated_at: string;
  created_at: string;
}

<<<<<<< HEAD
export class SpecBuilder {
  private name: string = "";
  private config: SpecConfig = new SpecConfigBuilder();

  constructor(private serializer: Serializer<Spec>) {}

  build(): Spec {
    if (this.name == "") throw new Error("Name required to build spec");

    if (this.config == null) throw new Error("Config required to build spec");
    if (this.config.image == "")
      throw new Error("Image required to build spec");

    const obj = Object.create(null);
    obj.name = this.name;
    obj.config = this.config;

    return this.serializer.serialize(obj);
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }
  withImage(image: string): this {
    this.config.image = image;
    return this;
  }

  withImageTag(tag: string): this {
    this.config.tag = tag;
    return this;
  }

  withRegistry(registry: string): this {
    this.config.registry = registry;
    return this;
  }

  withContainerPort(port: number) {
    this.config.container_port = port.toString();
    return this;
  }

  withHostPort(port: number) {
    this.config.host_port = port.toString();
    return this;
  }

  withEnv(key: string, value: string) {
    this.config.env[key] = value;
    return this;
  }

  withVolume(hostVolume: string, containerVolume: string) {
    this.config.volumes[hostVolume] = containerVolume;
    return this;
  }
}

interface SpecConfig {
  registry?: string;
  container_port?: string;
  host_port?: string;
=======
interface SpecConfig {
  registry?: string;
  container_port?: string;
  host_post?: string;
>>>>>>> ea99882bca9921a4acc9190ebe4babd81785dc93
  image: string;
  tag: string;
  env: { [key: string]: string };
  volumes: { [key: string]: string };
}
<<<<<<< HEAD

export class SpecConfigBuilder {
  image: string = "";
  registry: string = "";
  tag: string = "";
  container_port: string = "";
  host_port: string = "";
  env: { [key: string]: string } = {};
  volumes: { [key: string]: string } = {};
}
=======
>>>>>>> ea99882bca9921a4acc9190ebe4babd81785dc93
