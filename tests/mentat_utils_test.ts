import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as mentat from "../mentat/mod.ts";

Deno.test("Mentat :: utils :: Correct range size", () => {
  let r = mentat.utils.range(10);
  assertEquals(r.length, 10);
});

Deno.test("Mentat :: utils :: Correct rep size", () => {
  let r = mentat.utils.rep([10, 10], 0);
  assertEquals(r.length, 10);
  assertEquals(r[0].length, 10);
});
