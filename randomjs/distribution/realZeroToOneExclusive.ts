import { Engine } from "../types.ts";
import { SMALLEST_UNSAFE_INTEGER } from "../utils/constants.ts";
import { uint53 } from "./uint53.ts";

/**
 * Returns a floating-point value within [0.0, 1.0)
 */
export function realZeroToOneExclusive(engine: Engine): number {
  return uint53(engine) / SMALLEST_UNSAFE_INTEGER;
}
