/**
 * INFO: Interface definitions for K8s resources
 */

import { stringify as yamlStringify } from "https://deno.land/std/encoding/yaml.ts";

export interface KubernetesResource extends Record<string, unknown> {
  apiVersion: string;
  kind: string;
}

export interface Deployment extends KubernetesResource {
  metadata: {
    name: string;
    labels: {
      app: string;
    };
  };
}

const defaultDeployment = (): Deployment => {
  const d = {
    apiVersion: "app/v1",
    kind: "Deployment",
    metadata: {
      name: "octopus-deployment",
      labels: {
        app: "web",
      },
    },
  };
  return d;
};

interface ResourceManager {
  asYaml(): string;
}

abstract class AbstractResourceManager<T extends Record<string, unknown>>
  implements ResourceManager
{
  readonly resource: T;

  constructor(resource: T) {
    this.resource = resource;
  }

  asYaml(): string {
    return yamlStringify(this.resource);
  }
}

export class DeploymentManager extends AbstractResourceManager<Deployment> {
  constructor() {
    super(defaultDeployment());
  }
}
