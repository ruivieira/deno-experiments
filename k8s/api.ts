import { DeploymentManager } from "../common/k8s/api.ts";

const d = new DeploymentManager("test");

console.log(d.asYaml());
