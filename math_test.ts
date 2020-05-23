import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as math from "./math.ts";

Deno.test("Correct range size", () => {
  let r = math.range(10);
  assertEquals(r.length, 10);
});

Deno.test("Correct rep size", () => {
  let r = math.rep([10, 10], 0);
  assertEquals(r.length, 10);
  assertEquals(r[0].length, 10);
});
