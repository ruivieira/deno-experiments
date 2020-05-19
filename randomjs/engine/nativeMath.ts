import { Engine } from "../types.ts";
import { UINT32_SIZE } from "../utils/constants.ts";

/**
 * An int32-producing Engine that uses `Math.random()`
 */
export const nativeMath: Engine = {
  next() {
    return (Math.random() * UINT32_SIZE) | 0;
  }
};
