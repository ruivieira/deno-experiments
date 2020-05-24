import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as mentat from "./mentat/mod.ts";

Deno.test("Mentat :: linalg :: Correct data size", () => {
  let matrix = mentat.linalg.Zeros(3, 3);
  assertEquals(matrix.data.length, 9);
});
