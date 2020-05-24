import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as mentat from "./mentat/mod.ts";
import * as utils from "./mentat/utils.ts";

function assertEqualsDelta(
  actual: number,
  expected: number,
  delta: number,
  msg?: string,
): void {
  assertEquals(
    (actual < expected + delta) || (actual > expected - delta),
    true,
  );
}

Deno.test("Mentat :: stats :: Correct Normal sample size", () => {
  let n = new mentat.stats.distributions.Normal(0, 1);
  const N = 1000;
  let samples = n.sampleN(N);
  assertEquals(samples.length, N);
});

Deno.test("Mentat :: stats :: Correct Normal mean", () => {
  let n = new mentat.stats.distributions.Normal(0, 1);
  const N = 10000;
  let samples = n.sampleN(N);
  assertEqualsDelta(utils.mean(samples), 0.0, 0.001);
});
