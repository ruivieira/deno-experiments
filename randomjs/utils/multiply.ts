import { Distribution } from "../types.ts";

export function multiply(
  distribution: Distribution,
  multiplier: number
): Distribution {
  if (multiplier === 1) {
    return distribution;
  } else if (multiplier === 0) {
    return () => 0;
  } else {
    return engine => distribution(engine) * multiplier;
  }
}
