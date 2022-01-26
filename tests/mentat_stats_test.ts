import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Eye, Matrix } from "../mentat/linalg/core.ts";

import * as mentat from "../mentat/mod.ts";
import * as utils from "../mentat/utils.ts";

function assertEqualsDelta(
  actual: number,
  expected: number,
  delta: number,
  msg?: string,
): void {
  assertEquals(actual < expected + delta || actual > expected - delta, true);
}

Deno.test("Mentat :: stats :: Correct Normal sample size", () => {
  const n = new mentat.stats.distributions.Normal(0, 1);
  const N = 1000;
  const samples = n.sampleN(N);
  assertEquals(samples.length, N);
});

Deno.test("Mentat :: stats :: Correct Normal mean", () => {
  const n = new mentat.stats.distributions.Normal(0, 1);
  const N = 10000;
  const samples = n.sampleN(N);
  assertEqualsDelta(utils.mean(samples), 0.0, 0.001);
});

Deno.test("Mentat :: stats :: Correct MVN sample size", () => {
  const mean = [1, 2, 3];
  const cov = Eye(3);
  const n = new mentat.stats.distributions.MultivariateNormal(mean, cov);
  const sample = n.sample();
  assertEquals(3, sample.length);
});

Deno.test("Mentat :: stats :: Correct MVN mean", () => {
  const mean = [1, 2, 3];
  const cov = Eye(3);
  const n = new mentat.stats.distributions.MultivariateNormal(mean, cov);
  const N = 10000;
  const samples = n.sampleN(N);
  assertEqualsDelta(utils.mean(samples.map((x) => x[0])), mean[0], 0.001);
  assertEqualsDelta(utils.mean(samples.map((x) => x[1])), mean[1], 0.001);
  assertEqualsDelta(utils.mean(samples.map((x) => x[2])), mean[2], 0.001);
});
