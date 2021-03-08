import { MersenneTwister19937 } from "../randomjs/engine/MersenneTwister19937.ts";
import { Random } from "../randomjs/Random.ts";
import { Engine } from "../randomjs/types.ts";
import { nativeMath } from "../randomjs/engine/nativeMath.ts";

abstract class RandomTest {
  distribution: Random;
  constructor(engine: Engine) {
    this.distribution = new Random(engine);
  }
  sample(n: number, min: number, max: number): number[] {
    return Array.from({ length: n }, () => this.distribution.real(min, max));
  }
}

class MersenneTwister19937Test extends RandomTest {
  constructor() {
    super(MersenneTwister19937.autoSeed());
  }
}

class NativeMathTest extends RandomTest {
  constructor() {
    super(nativeMath);
  }
}

(window as any).MersenneTwister19937Test = MersenneTwister19937Test;
(window as any).NativeMathTest = NativeMathTest;
