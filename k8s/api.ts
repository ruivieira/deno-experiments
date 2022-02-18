import {
stringify as yamlStringify,
  } from 'https://deno.land/std/encoding/yaml.ts';
import { Deployment } from "../common/k8s/api.ts";



const test: Deployment = {
    apiVersion: "app/v1",
    metadata: {
        name: "octopus-deployment",
        labels: {
            app: "web"
        }
    }
}

export const getDeploymentYaml = (deployment: Deployment) : string => {
    deployment["kind"] = "Deployment"
    return yamlStringify(test)
}

console.log(getDeploymentYaml(test))