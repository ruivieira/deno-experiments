import { Matrix } from "../mentat/linalg/core.ts";

const m = new Matrix([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, 3);
console.log(m.toString(1));

m.addColumn([0.5, 0.5, 0.5]);
console.log(m.toString(1));
