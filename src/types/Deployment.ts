import { Container } from "./Container";
import { Spec } from "./Spec";

export interface Deployment {
  alias: string;
  spec: Spec;
  containers: Container[];
}
