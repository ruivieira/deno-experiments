import { DeploymentManager } from "../common/k8s/api.ts";

const d = new DeploymentManager();

d.resource.metadata.name = "test";

console.log(d.asYaml());
