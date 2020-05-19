import { Engine } from "../types.ts";
import { SMALLEST_UNSAFE_INTEGER } from "../utils/constants.ts";
import { uint53Full } from "./uint53Full.ts";

/**
 * Returns a floating-point value within [0.0, 1.0]
 */
export function realZeroToOneInclusive(engine: Engine): number {
  return uint53Full(engine) / SMALLEST_UNSAFE_INTEGER;
}
