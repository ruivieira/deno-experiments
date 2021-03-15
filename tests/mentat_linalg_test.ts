import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as mentat from "../mentat/mod.ts";
import {Matrix} from "../mentat/linalg/core.ts";

Deno.test("Mentat :: linalg :: Correct data size", () => {
  let matrix = mentat.linalg.Zeros(3, 3);
  assertEquals(matrix.data.length, 9);
});

Deno.test("Mentat :: linalg :: Add column", () => {
  const data = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9])
  const matrix = new Matrix(data, 3, 3)

  matrix.addColumn([0.5, 0.5, 0.5])
  assertEquals(matrix.data.length, 12);
  assertEquals(matrix.data, new Float64Array([1, 2, 3, 0.5, 4, 5, 6, 0.5, 7, 8, 9, 0.5]));
});

Deno.test("Mentat :: linalg :: Add column (array)", () => {
  const _y = [
    [0, 0, 0],
    [2, 4, 3],
    [4, 6, 5],
    [6, 8, 7]
  ];
  const matrix = new Matrix(_y.flat(), 4, 3)
  let new_col = new Array(matrix.rows).fill(1);
  matrix.addColumn(new_col)
  assertEquals(matrix.data.length, 16);
  console.log(matrix.toString(1))
  // assertEquals(matrix.data, new Float64Array([0, 0, 0, 1, 2, 4, 3, 1, 4, 6, 5, 1, 6, 8, 7, 1]));
});

