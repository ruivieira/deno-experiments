import { MLR } from "../external/regression.js";

const x = [
  [0, 0],
  [1, 2],
  [2, 3],
  [3, 4],
];
// Y0 = X0 * 2, Y1 = X1 * 2, Y2 = X0 + X1
const y = [
  [0, 0, 0],
  [2, 4, 3],
  [4, 6, 5],
  [6, 8, 7],
];
const mlr = new MLR(x, y);
console.log(mlr.predict([3, 3]));
// [6, 6, 6]
