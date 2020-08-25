import { Command, flags } from "@oclif/command";
import { createAppContext } from "../Context";

import { KraneApiClient } from "../KraneApiClient";
import { SpecBuilder, Spec } from "../types/Spec";
import { JsonSerializer } from "../serializer/JsonSerializer";
import { memoize } from "lodash";
import { KRANE_UI_IMAGE, KRANE_UI_CONTAINER_PORT } from "../KraneConstants";
import { findOpenPort } from "../KranePortUtil";

export default class Ui extends Command {
  ctx = createAppContext();
  serializer = memoize(() => new JsonSerializer<Spec>());

  static description = "Deploy a local version of Krane UI";

  static flags = {
    endpoint: flags.string({ char: "e" }), // --endpoint or -e
    token: flags.string({ char: "t" }), // --token or -t
  };

  async run() {
    await this.ctx.init();
    const { flags } = this.parse(Ui);

    const endpoint = flags.endpoint ?? this.ctx.serverEndpoint;
    const token = flags.token ?? this.ctx.authState.getTokenInfo()?.token;

    if (!endpoint) {
      this.error("Krane endpoint required");
    }

    if (!token) {
      this.error("Krane token required");
    }

    // Build a spec to create the Krane UI deployment
    const bodySerializer = this.serializer();
    const builder = new SpecBuilder(bodySerializer);
    builder.withName("kraneui");
    builder.withImage(KRANE_UI_IMAGE);
    builder.withContainerPort(KRANE_UI_CONTAINER_PORT);
    builder.withHostPort(findOpenPort([]));
    builder.withEnv("KRANE_HOST", endpoint);
    builder.withEnv("KRANE_TOKEN", token);
    const spec = builder.build();

    const uiEndpoint = this.ctx.serverEndpoint + ":" + spec.config.host_port;

    const api = new KraneApiClient(endpoint, token);

    try {
      await api.applySpec(spec);
    } catch (e) {
      this.error("Unable to apply UI configuration", e);
    }

    try {
      await api.runDeployment(spec.name);
    } catch (e) {
      this.error("Unable to run deployment", e);
    }

    this.log(`Krane UI should be available at ${uiEndpoint}`);
  }

  sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
}
