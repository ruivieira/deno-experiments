/**
 * INFO: Interface definitions for K8s resources
 */

import { stringify as yamlStringify } from "https://deno.land/std/encoding/yaml.ts";
import { Container } from "../containers/core.ts";

export interface KubernetesResource extends Record<string, unknown> {
  apiVersion: string;
  kind: string;
  metadata: Metadata;
  spec: Spec;
}

export interface Metadata {
  readonly name: string;
  labels: {
    app: string;
  };
}

export enum ImagePullPolicy {
  IF_NOT_PRESENT = "IfNotPresent",
  ALWAYS = "Always",
  NEVER = "Never",
}

export interface SpecTemplateContainer {
  image: string;
  name: string;
  imagePullPolicy: ImagePullPolicy;
}

export interface SpecTemplate {
  spec?: {
    containers?: Array<SpecTemplateContainer>;
    container?: SpecTemplateContainer;
  };
}

export interface Spec {
  replicas: number;
  template?: SpecTemplate;
}

// export interface Deployment extends KubernetesResource {}
type Deployment = KubernetesResource;

const defaultDeployment = (name: string): Deployment => {
  const d = {
    apiVersion: "app/v1",
    kind: "Deployment",
    metadata: {
      name: name,
      labels: {
        app: "web",
      },
    },
    spec: {
      replicas: 1,
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

  saveAs(path: string) {
    Deno.writeTextFile(path, this.asYaml());
  }
}

export class DeploymentManager extends AbstractResourceManager<Deployment> {
  constructor(name: string) {
    super(defaultDeployment(name));
  }

  public static fromContainer(container: Container): DeploymentManager {
    const result = new DeploymentManager(container.identifier.name);
    // add container spec
    result.resource.spec.template = {
      spec: {
        containers: [
          {
            image: `${container.identifier.name}:${container.identifier.tag}`,
            name: container.identifier.name,
            imagePullPolicy: ImagePullPolicy.NEVER,
          },
        ],
      },
    };
    return result;
  }
}
