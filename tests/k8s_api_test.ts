import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Container } from "../common/containers/core.ts";
import { DeploymentManager } from "../common/k8s/api.ts";

const expected = `apiVersion: app/v1
kind: Deployment
metadata:
  name: test-app
  labels:
    app: web
spec:
  replicas: 1
`;

Deno.test("K8s :: API :: Deployment default", () => {
  const deployment = new DeploymentManager("test-app");
  console.log(deployment.asYaml());

  assertEquals(deployment.asYaml(), expected);
});

Deno.test("K8s :: API :: Deployment from container", () => {
  const id = { name: "test-app", tag: "latest" };
  const container = new Container(id, "scratch");

  const deployment = DeploymentManager.fromContainer(container);
  assertEquals(deployment.asYaml(), expected);
});
