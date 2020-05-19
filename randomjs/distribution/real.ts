import { Distribution } from "../types.ts";
import { add } from "../utils/add.ts";
import { multiply } from "../utils/multiply.ts";
import { realZeroToOneExclusive } from "./realZeroToOneExclusive.ts";
import { realZeroToOneInclusive } from "./realZeroToOneInclusive.ts";

/**
 * Returns a floating-point value within [min, max) or [min, max]
 * @param min The minimum floating-point value, inclusive.
 * @param max The maximum floating-point value.
 * @param inclusive If true, `max` will be inclusive.
 */
export function real(
  min: number,
  max: number,
  inclusive: boolean = false
): Distribution {
  if (!isFinite(min)) {
    throw new RangeError("Expected min to be a finite number");
  } else if (!isFinite(max)) {
    throw new RangeError("Expected max to be a finite number");
  }
  return add(
    multiply(
      inclusive ? realZeroToOneInclusive : realZeroToOneExclusive,
      max - min
    ),
    min
  );
}
