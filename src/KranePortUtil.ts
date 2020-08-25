import { Deployment } from "./types/Deployment";
import Deploy from "./commands/deploy";

export const findOpenPort = (deployments: Deployment[]): number => {
  let selectedPort = getRandomIntInclusive(3000, 9999);
  // TODO: add logic to loop over deployments and check if selected port is already taken xD
  return selectedPort;
};

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
