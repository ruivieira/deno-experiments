import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { DeploymentManager } from "../common/k8s/api.ts";

Deno.test("K8s :: API :: Deployment default", () => {
  const deployment = new DeploymentManager("test-app");
  console.log(deployment.asYaml());
  const expected = `apiVersion: app/v1
kind: Deployment
metadata:
  name: test-app
  labels:
    app: web
`;
  assertEquals(deployment.asYaml(), expected);
});
