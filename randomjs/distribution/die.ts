import { Distribution } from "../types.ts";
import { integer } from "./integer.ts";

/**
 * Returns a Distribution to return a value within [1, sideCount]
 * @param sideCount The number of sides of the die
 */
export function die(sideCount: number): Distribution<number> {
  return integer(1, sideCount);
}
