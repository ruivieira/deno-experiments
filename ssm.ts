/**
 * INFO: state-space models (SSM) experiments
 */

import * as c from "./linalg/core.ts";
import { rnorm } from "./bayesjs/mcmc.ts";
import * as mvn from "./mvngaussian.ts";

// locally linear

let theta_0 = new c.Vector([1.2]);
let F = new c.Matrix([1, 0], 1, 1);
console.log(`F = ${F.toString(2)}`);
let G = new c.Matrix([1], 1, 1);
console.log(`G = ${G.toString(2)}`);

let thetas = [theta_0];
const N = 10000;
let w = new mvn.MultivariateNormal(
  c.Vector.zeros(1),
  new c.Matrix([5.1], 1, 1),
);
for (let i = 1; i < N; i++) {
  let theta = G.multiply(thetas[i - 1]) as c.Vector;
  theta = theta.add(w.getSample());
  // theta = theta.add(rnorm(0, 5.1));
  thetas.push(theta);
  console.log(theta.data[0]);
}

// calculate mean
let W = new c.Matrix([50.1, 0.0, 0.0, 10.1], 2, 2);
let x = new mvn.MultivariateNormal(new c.Vector([1.0, 1.0]), W);
console.log(W.asNestedArray());
let svd = W.svd();
console.log(svd.S.toString());
console.log(svd.U.toString(2));
console.log(svd.V.toString(2));
var sum1 = 0.0;
var sum2 = 0.0;
let test_samples1 = new Array(N);
let test_samples2 = new Array(N);
for (let i = 0; i < N * 100; i++) {
  let s = x.getSample();
  test_samples1[i] = s.data[0];
  test_samples2[i] = s.data[1];
  sum1 += test_samples1[i];
  sum2 += test_samples2[i];
}
console.log(test_samples1);
console.log(test_samples2);
console.log(`mean1: ${sum1 / N}`);
console.log(`mean2: ${sum2 / N}`);
