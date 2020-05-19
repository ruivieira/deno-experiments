// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

// @ts-nocheck
/* eslint-disable */
let System, __instantiateAsync, __instantiate;

(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };

  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }

  __instantiateAsync = async (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExpA(m);
  };

  __instantiate = (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExp(m);
  };
})();

System.register("randomjs/types", [], function (exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  return {
    setters: [],
    execute: function () {
    },
  };
});
System.register(
  "randomjs/utils/constants",
  [],
  function (exports_2, context_2) {
    "use strict";
    var SMALLEST_UNSAFE_INTEGER,
      LARGEST_SAFE_INTEGER,
      UINT32_MAX,
      UINT32_SIZE,
      INT32_SIZE,
      INT32_MAX,
      UINT21_SIZE,
      UINT21_MAX;
    var __moduleName = context_2 && context_2.id;
    return {
      setters: [],
      execute: function () {
        exports_2(
          "SMALLEST_UNSAFE_INTEGER",
          SMALLEST_UNSAFE_INTEGER = 0x20000000000000,
        );
        exports_2(
          "LARGEST_SAFE_INTEGER",
          LARGEST_SAFE_INTEGER = SMALLEST_UNSAFE_INTEGER - 1,
        );
        exports_2("UINT32_MAX", UINT32_MAX = -1 >>> 0);
        exports_2("UINT32_SIZE", UINT32_SIZE = UINT32_MAX + 1);
        exports_2("INT32_SIZE", INT32_SIZE = UINT32_SIZE / 2);
        exports_2("INT32_MAX", INT32_MAX = INT32_SIZE - 1);
        exports_2("UINT21_SIZE", UINT21_SIZE = 1 << 21);
        exports_2("UINT21_MAX", UINT21_MAX = UINT21_SIZE - 1);
      },
    };
  },
);
System.register(
  "randomjs/engine/nativeMath",
  ["randomjs/utils/constants"],
  function (exports_3, context_3) {
    "use strict";
    var constants_ts_1, nativeMath;
    var __moduleName = context_3 && context_3.id;
    return {
      setters: [
        function (constants_ts_1_1) {
          constants_ts_1 = constants_ts_1_1;
        },
      ],
      execute: function () {
        /**
             * An int32-producing Engine that uses `Math.random()`
             */
        exports_3(
          "nativeMath",
          nativeMath = {
            next() {
              return (Math.random() * constants_ts_1.UINT32_SIZE) | 0;
            },
          },
        );
      },
    };
  },
);
System.register(
  "randomjs/utils/createEntropy",
  ["randomjs/engine/nativeMath"],
  function (exports_4, context_4) {
    "use strict";
    var nativeMath_ts_1;
    var __moduleName = context_4 && context_4.id;
    /**
     * Returns an array of random int32 values, based on current time
     * and a random number engine
     *
     * @param engine an Engine to pull random values from, default `nativeMath`
     * @param length the length of the Array, minimum 1, default 16
     */
    function createEntropy(engine = nativeMath_ts_1.nativeMath, length = 16) {
      const array = [];
      array.push(new Date().getTime() | 0);
      for (let i = 1; i < length; ++i) {
        array[i] = engine.next() | 0;
      }
      return array;
    }
    exports_4("createEntropy", createEntropy);
    return {
      setters: [
        function (nativeMath_ts_1_1) {
          nativeMath_ts_1 = nativeMath_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/utils/imul",
  ["randomjs/utils/constants"],
  function (exports_5, context_5) {
    "use strict";
    var constants_ts_2, imul;
    var __moduleName = context_5 && context_5.id;
    return {
      setters: [
        function (constants_ts_2_1) {
          constants_ts_2 = constants_ts_2_1;
        },
      ],
      execute: function () {
        /**
             * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
             */
        exports_5(
          "imul",
          imul = (() => {
            try {
              if (Math.imul(constants_ts_2.UINT32_MAX, 5) === -5) {
                return Math.imul;
              }
            } catch (_) {
              // nothing to do here
            }
            const UINT16_MAX = 0xffff;
            return (a, b) => {
              const ah = (a >>> 16) & UINT16_MAX;
              const al = a & UINT16_MAX;
              const bh = (b >>> 16) & UINT16_MAX;
              const bl = b & UINT16_MAX;
              // the shift by 0 fixes the sign on the high part
              // the final |0 converts the unsigned value into a signed value
              return (al * bl + (((ah * bl + al * bh) << 16) >>> 0)) | 0;
            };
          })(),
        );
      },
    };
  },
);
System.register(
  "randomjs/utils/Int32Array",
  ["randomjs/utils/constants"],
  function (exports_6, context_6) {
    "use strict";
    var constants_ts_3, I32Array;
    var __moduleName = context_6 && context_6.id;
    return {
      setters: [
        function (constants_ts_3_1) {
          constants_ts_3 = constants_ts_3_1;
        },
      ],
      execute: function () {
        /**
             * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
             */
        I32Array = (() => {
          try {
            const buffer = new ArrayBuffer(4);
            const view = new Int32Array(buffer);
            view[0] = constants_ts_3.INT32_SIZE;
            if (view[0] === -constants_ts_3.INT32_SIZE) {
              return Int32Array;
            }
          } catch (_) {
            // nothing to do here
          }
          return Array;
        })();
        exports_6("Int32Array", I32Array);
      },
    };
  },
);
System.register(
  "randomjs/engine/MersenneTwister19937",
  [
    "randomjs/utils/constants",
    "randomjs/utils/createEntropy",
    "randomjs/utils/imul",
    "randomjs/utils/Int32Array",
  ],
  function (exports_7, context_7) {
    "use strict";
    var constants_ts_4,
      createEntropy_ts_1,
      imul_ts_1,
      Int32Array_ts_1,
      ARRAY_SIZE,
      ARRAY_MAX,
      M,
      ARRAY_SIZE_MINUS_M,
      A,
      MersenneTwister19937;
    var __moduleName = context_7 && context_7.id;
    function refreshData(data) {
      let k = 0;
      let tmp = 0;
      for (; (k | 0) < ARRAY_SIZE_MINUS_M; k = (k + 1) | 0) {
        tmp = (data[k] & constants_ts_4.INT32_SIZE) |
          (data[(k + 1) | 0] & constants_ts_4.INT32_MAX);
        data[k] = data[(k + M) | 0] ^ (tmp >>> 1) ^ (tmp & 0x1 ? A : 0);
      }
      for (; (k | 0) < ARRAY_MAX; k = (k + 1) | 0) {
        tmp = (data[k] & constants_ts_4.INT32_SIZE) |
          (data[(k + 1) | 0] & constants_ts_4.INT32_MAX);
        data[k] = data[(k - ARRAY_SIZE_MINUS_M) | 0] ^ (tmp >>> 1) ^
          (tmp & 0x1 ? A : 0);
      }
      tmp = (data[ARRAY_MAX] & constants_ts_4.INT32_SIZE) |
        (data[0] & constants_ts_4.INT32_MAX);
      data[ARRAY_MAX] = data[M - 1] ^ (tmp >>> 1) ^ (tmp & 0x1 ? A : 0);
    }
    function temper(value) {
      value ^= value >>> 11;
      value ^= (value << 7) & 0x9d2c5680;
      value ^= (value << 15) & 0xefc60000;
      return value ^ (value >>> 18);
    }
    function seedWithArray(data, source) {
      let i = 1;
      let j = 0;
      const sourceLength = source.length;
      let k = Math.max(sourceLength, ARRAY_SIZE) | 0;
      let previous = data[0] | 0;
      for (; (k | 0) > 0; --k) {
        data[i] = previous =
          ((data[i] ^
            imul_ts_1.imul(previous ^ (previous >>> 30), 0x0019660d)) +
            (source[j] | 0) +
            (j | 0)) |
          0;
        i = (i + 1) | 0;
        ++j;
        if ((i | 0) > ARRAY_MAX) {
          data[0] = data[ARRAY_MAX];
          i = 1;
        }
        if (j >= sourceLength) {
          j = 0;
        }
      }
      for (k = ARRAY_MAX; (k | 0) > 0; --k) {
        data[i] = previous =
          ((data[i] ^
            imul_ts_1.imul(previous ^ (previous >>> 30), 0x5d588b65)) - i) | 0;
        i = (i + 1) | 0;
        if ((i | 0) > ARRAY_MAX) {
          data[0] = data[ARRAY_MAX];
          i = 1;
        }
      }
      data[0] = constants_ts_4.INT32_SIZE;
    }
    return {
      setters: [
        function (constants_ts_4_1) {
          constants_ts_4 = constants_ts_4_1;
        },
        function (createEntropy_ts_1_1) {
          createEntropy_ts_1 = createEntropy_ts_1_1;
        },
        function (imul_ts_1_1) {
          imul_ts_1 = imul_ts_1_1;
        },
        function (Int32Array_ts_1_1) {
          Int32Array_ts_1 = Int32Array_ts_1_1;
        },
      ],
      execute: function () {
        ARRAY_SIZE = 624;
        ARRAY_MAX = ARRAY_SIZE - 1;
        M = 397;
        ARRAY_SIZE_MINUS_M = ARRAY_SIZE - M;
        A = 0x9908b0df;
        /**
             * An Engine that is a pseudorandom number generator using the Mersenne
             * Twister algorithm based on the prime 2**19937 − 1
             *
             * See http://en.wikipedia.org/wiki/Mersenne_twister
             */
        MersenneTwister19937 = class MersenneTwister19937 {
          /**
                 * MersenneTwister19937 should not be instantiated directly.
                 * Instead, use the static methods `seed`, `seedWithArray`, or `autoSeed`.
                 */
          constructor() {
            this.data = new Int32Array_ts_1.Int32Array(ARRAY_SIZE);
            this.index = 0; // integer within [0, 624]
            this.uses = 0;
          }
          /**
                 * Returns a MersenneTwister19937 seeded with an initial int32 value
                 * @param initial the initial seed value
                 */
          static seed(initial) {
            return new MersenneTwister19937().seed(initial);
          }
          /**
                 * Returns a MersenneTwister19937 seeded with zero or more int32 values
                 * @param source A series of int32 values
                 */
          static seedWithArray(source) {
            return new MersenneTwister19937().seedWithArray(source);
          }
          /**
                 * Returns a MersenneTwister19937 seeded with the current time and
                 * a series of natively-generated random values
                 */
          static autoSeed() {
            return MersenneTwister19937.seedWithArray(
              createEntropy_ts_1.createEntropy(),
            );
          }
          /**
                 * Returns the next int32 value of the sequence
                 */
          next() {
            if ((this.index | 0) >= ARRAY_SIZE) {
              refreshData(this.data);
              this.index = 0;
            }
            const value = this.data[this.index];
            this.index = (this.index + 1) | 0;
            this.uses += 1;
            return temper(value) | 0;
          }
          /**
                 * Returns the number of times that the Engine has been used.
                 *
                 * This can be provided to an unused MersenneTwister19937 with the same
                 * seed, bringing it to the exact point that was left off.
                 */
          getUseCount() {
            return this.uses;
          }
          /**
                 * Discards one or more items from the engine
                 * @param count The count of items to discard
                 */
          discard(count) {
            if (count <= 0) {
              return this;
            }
            this.uses += count;
            if ((this.index | 0) >= ARRAY_SIZE) {
              refreshData(this.data);
              this.index = 0;
            }
            while (count + this.index > ARRAY_SIZE) {
              count -= ARRAY_SIZE - this.index;
              refreshData(this.data);
              this.index = 0;
            }
            this.index = (this.index + count) | 0;
            return this;
          }
          seed(initial) {
            let previous = 0;
            this.data[0] = previous = initial | 0;
            for (let i = 1; i < ARRAY_SIZE; i = (i + 1) | 0) {
              this.data[i] = previous =
                (imul_ts_1.imul(previous ^ (previous >>> 30), 0x6c078965) + i) |
                0;
            }
            this.index = ARRAY_SIZE;
            this.uses = 0;
            return this;
          }
          seedWithArray(source) {
            this.seed(0x012bd6aa);
            seedWithArray(this.data, source);
            return this;
          }
        };
        exports_7("MersenneTwister19937", MersenneTwister19937);
      },
    };
  },
);
System.register(
  "randomjs/distribution/int32",
  [],
  function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    /**
     * Returns a value within [-0x80000000, 0x7fffffff]
     */
    function int32(engine) {
      return engine.next() | 0;
    }
    exports_8("int32", int32);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register("randomjs/utils/add", [], function (exports_9, context_9) {
  "use strict";
  var __moduleName = context_9 && context_9.id;
  function add(distribution, addend) {
    if (addend === 0) {
      return distribution;
    } else {
      return (engine) => distribution(engine) + addend;
    }
  }
  exports_9("add", add);
  return {
    setters: [],
    execute: function () {
    },
  };
});
System.register(
  "randomjs/distribution/int53",
  ["randomjs/utils/constants"],
  function (exports_10, context_10) {
    "use strict";
    var constants_ts_5;
    var __moduleName = context_10 && context_10.id;
    /**
     * Returns a value within [-0x20000000000000, 0x1fffffffffffff]
     */
    function int53(engine) {
      const high = engine.next() | 0;
      const low = engine.next() >>> 0;
      return ((high & constants_ts_5.UINT21_MAX) * constants_ts_5.UINT32_SIZE +
        low +
        (high & constants_ts_5.UINT21_SIZE
          ? -constants_ts_5.SMALLEST_UNSAFE_INTEGER : 0));
    }
    exports_10("int53", int53);
    return {
      setters: [
        function (constants_ts_5_1) {
          constants_ts_5 = constants_ts_5_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/int53Full",
  ["randomjs/utils/constants"],
  function (exports_11, context_11) {
    "use strict";
    var constants_ts_6;
    var __moduleName = context_11 && context_11.id;
    /**
     * Returns a value within [-0x20000000000000, 0x20000000000000]
     */
    function int53Full(engine) {
      while (true) {
        const high = engine.next() | 0;
        if (high & 0x400000) {
          if ((high & 0x7fffff) === 0x400000 && (engine.next() | 0) === 0) {
            return constants_ts_6.SMALLEST_UNSAFE_INTEGER;
          }
        } else {
          const low = engine.next() >>> 0;
          return ((high & constants_ts_6.UINT21_MAX) *
              constants_ts_6.UINT32_SIZE +
            low +
            (high & constants_ts_6.UINT21_SIZE
              ? -constants_ts_6.SMALLEST_UNSAFE_INTEGER : 0));
        }
      }
    }
    exports_11("int53Full", int53Full);
    return {
      setters: [
        function (constants_ts_6_1) {
          constants_ts_6 = constants_ts_6_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/uint32",
  [],
  function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    /**
     * Returns a value within [0, 0xffffffff]
     */
    function uint32(engine) {
      return engine.next() >>> 0;
    }
    exports_12("uint32", uint32);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/uint53",
  ["randomjs/utils/constants"],
  function (exports_13, context_13) {
    "use strict";
    var constants_ts_7;
    var __moduleName = context_13 && context_13.id;
    /**
     * Returns a value within [0, 0x1fffffffffffff]
     */
    function uint53(engine) {
      const high = engine.next() & constants_ts_7.UINT21_MAX;
      const low = engine.next() >>> 0;
      return high * constants_ts_7.UINT32_SIZE + low;
    }
    exports_13("uint53", uint53);
    return {
      setters: [
        function (constants_ts_7_1) {
          constants_ts_7 = constants_ts_7_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/uint53Full",
  ["randomjs/utils/constants"],
  function (exports_14, context_14) {
    "use strict";
    var constants_ts_8;
    var __moduleName = context_14 && context_14.id;
    /**
     * Returns a value within [0, 0x20000000000000]
     */
    function uint53Full(engine) {
      while (true) {
        const high = engine.next() | 0;
        if (high & constants_ts_8.UINT21_SIZE) {
          if (
            (high & constants_ts_8.UINT21_MAX) === 0 &&
            (engine.next() | 0) === 0
          ) {
            return constants_ts_8.SMALLEST_UNSAFE_INTEGER;
          }
        } else {
          const low = engine.next() >>> 0;
          return (high & constants_ts_8.UINT21_MAX) *
              constants_ts_8.UINT32_SIZE + low;
        }
      }
    }
    exports_14("uint53Full", uint53Full);
    return {
      setters: [
        function (constants_ts_8_1) {
          constants_ts_8 = constants_ts_8_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/integer",
  [
    "randomjs/utils/add",
    "randomjs/utils/constants",
    "randomjs/distribution/int32",
    "randomjs/distribution/int53",
    "randomjs/distribution/int53Full",
    "randomjs/distribution/uint32",
    "randomjs/distribution/uint53",
    "randomjs/distribution/uint53Full",
  ],
  function (exports_15, context_15) {
    "use strict";
    var add_ts_1,
      constants_ts_9,
      int32_ts_1,
      int53_ts_1,
      int53Full_ts_1,
      uint32_ts_1,
      uint53_ts_1,
      uint53Full_ts_1;
    var __moduleName = context_15 && context_15.id;
    function isPowerOfTwoMinusOne(value) {
      return ((value + 1) & value) === 0;
    }
    function bitmask(masking) {
      return (engine) => engine.next() & masking;
    }
    function downscaleToLoopCheckedRange(range) {
      const extendedRange = range + 1;
      const maximum = extendedRange *
        Math.floor(constants_ts_9.UINT32_SIZE / extendedRange);
      return (engine) => {
        let value = 0;
        do {
          value = engine.next() >>> 0;
        } while (value >= maximum);
        return value % extendedRange;
      };
    }
    function downscaleToRange(range) {
      if (isPowerOfTwoMinusOne(range)) {
        return bitmask(range);
      } else {
        return downscaleToLoopCheckedRange(range);
      }
    }
    function isEvenlyDivisibleByMaxInt32(value) {
      return (value | 0) === 0;
    }
    function upscaleWithHighMasking(masking) {
      return (engine) => {
        const high = engine.next() & masking;
        const low = engine.next() >>> 0;
        return high * constants_ts_9.UINT32_SIZE + low;
      };
    }
    function upscaleToLoopCheckedRange(extendedRange) {
      const maximum = extendedRange *
        Math.floor(constants_ts_9.SMALLEST_UNSAFE_INTEGER / extendedRange);
      return (engine) => {
        let ret = 0;
        do {
          const high = engine.next() & constants_ts_9.UINT21_MAX;
          const low = engine.next() >>> 0;
          ret = high * constants_ts_9.UINT32_SIZE + low;
        } while (ret >= maximum);
        return ret % extendedRange;
      };
    }
    function upscaleWithinU53(range) {
      const extendedRange = range + 1;
      if (isEvenlyDivisibleByMaxInt32(extendedRange)) {
        const highRange = ((extendedRange / constants_ts_9.UINT32_SIZE) | 0) -
          1;
        if (isPowerOfTwoMinusOne(highRange)) {
          return upscaleWithHighMasking(highRange);
        }
      }
      return upscaleToLoopCheckedRange(extendedRange);
    }
    function upscaleWithinI53AndLoopCheck(min, max) {
      return (engine) => {
        let ret = 0;
        do {
          const high = engine.next() | 0;
          const low = engine.next() >>> 0;
          ret =
            (high & constants_ts_9.UINT21_MAX) * constants_ts_9.UINT32_SIZE +
            low +
            (high & constants_ts_9.UINT21_SIZE
              ? -constants_ts_9.SMALLEST_UNSAFE_INTEGER : 0);
        } while (ret < min || ret > max);
        return ret;
      };
    }
    /**
     * Returns a Distribution to return a value within [min, max]
     * @param min The minimum integer value, inclusive. No less than -0x20000000000000.
     * @param max The maximum integer value, inclusive. No greater than 0x20000000000000.
     */
    function integer(min, max) {
      min = Math.floor(min);
      max = Math.floor(max);
      if (min < -constants_ts_9.SMALLEST_UNSAFE_INTEGER || !isFinite(min)) {
        throw new RangeError(
          `Expected min to be at least ${-constants_ts_9
            .SMALLEST_UNSAFE_INTEGER}`,
        );
      } else if (
        max > constants_ts_9.SMALLEST_UNSAFE_INTEGER || !isFinite(max)
      ) {
        throw new RangeError(
          `Expected max to be at most ${constants_ts_9.SMALLEST_UNSAFE_INTEGER}`,
        );
      }
      const range = max - min;
      if (range <= 0 || !isFinite(range)) {
        return () => min;
      } else if (range === constants_ts_9.UINT32_MAX) {
        if (min === 0) {
          return uint32_ts_1.uint32;
        } else {
          return add_ts_1.add(
            int32_ts_1.int32,
            min + constants_ts_9.INT32_SIZE,
          );
        }
      } else if (range < constants_ts_9.UINT32_MAX) {
        return add_ts_1.add(downscaleToRange(range), min);
      } else if (range === constants_ts_9.LARGEST_SAFE_INTEGER) {
        return add_ts_1.add(uint53_ts_1.uint53, min);
      } else if (range < constants_ts_9.LARGEST_SAFE_INTEGER) {
        return add_ts_1.add(upscaleWithinU53(range), min);
      } else if (max - 1 - min === constants_ts_9.LARGEST_SAFE_INTEGER) {
        return add_ts_1.add(uint53Full_ts_1.uint53Full, min);
      } else if (
        min === -constants_ts_9.SMALLEST_UNSAFE_INTEGER &&
        max === constants_ts_9.SMALLEST_UNSAFE_INTEGER
      ) {
        return int53Full_ts_1.int53Full;
      } else if (
        min === -constants_ts_9.SMALLEST_UNSAFE_INTEGER &&
        max === constants_ts_9.LARGEST_SAFE_INTEGER
      ) {
        return int53_ts_1.int53;
      } else if (
        min === -constants_ts_9.LARGEST_SAFE_INTEGER &&
        max === constants_ts_9.SMALLEST_UNSAFE_INTEGER
      ) {
        return add_ts_1.add(int53_ts_1.int53, 1);
      } else if (max === constants_ts_9.SMALLEST_UNSAFE_INTEGER) {
        return add_ts_1.add(upscaleWithinI53AndLoopCheck(min - 1, max - 1), 1);
      } else {
        return upscaleWithinI53AndLoopCheck(min, max);
      }
    }
    exports_15("integer", integer);
    return {
      setters: [
        function (add_ts_1_1) {
          add_ts_1 = add_ts_1_1;
        },
        function (constants_ts_9_1) {
          constants_ts_9 = constants_ts_9_1;
        },
        function (int32_ts_1_1) {
          int32_ts_1 = int32_ts_1_1;
        },
        function (int53_ts_1_1) {
          int53_ts_1 = int53_ts_1_1;
        },
        function (int53Full_ts_1_1) {
          int53Full_ts_1 = int53Full_ts_1_1;
        },
        function (uint32_ts_1_1) {
          uint32_ts_1 = uint32_ts_1_1;
        },
        function (uint53_ts_1_1) {
          uint53_ts_1 = uint53_ts_1_1;
        },
        function (uint53Full_ts_1_1) {
          uint53Full_ts_1 = uint53Full_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/bool",
  [
    "randomjs/utils/constants",
    "randomjs/distribution/int32",
    "randomjs/distribution/integer",
    "randomjs/distribution/uint53",
  ],
  function (exports_16, context_16) {
    "use strict";
    var constants_ts_10, int32_ts_2, integer_ts_1, uint53_ts_2;
    var __moduleName = context_16 && context_16.id;
    function isLeastBitTrue(engine) {
      return (engine.next() & 1) === 1;
    }
    function lessThan(distribution, value) {
      return (engine) => distribution(engine) < value;
    }
    function probability(percentage) {
      if (percentage <= 0) {
        return () => false;
      } else if (percentage >= 1) {
        return () => true;
      } else {
        const scaled = percentage * constants_ts_10.UINT32_SIZE;
        if (scaled % 1 === 0) {
          return lessThan(
            int32_ts_2.int32,
            (scaled - constants_ts_10.INT32_SIZE) | 0,
          );
        } else {
          return lessThan(
            uint53_ts_2.uint53,
            Math.round(percentage * constants_ts_10.SMALLEST_UNSAFE_INTEGER),
          );
        }
      }
    }
    function bool(numerator, denominator) {
      if (denominator == null) {
        if (numerator == null) {
          return isLeastBitTrue;
        }
        return probability(numerator);
      } else {
        if (numerator <= 0) {
          return () => false;
        } else if (numerator >= denominator) {
          return () => true;
        }
        return lessThan(integer_ts_1.integer(0, denominator - 1), numerator);
      }
    }
    exports_16("bool", bool);
    return {
      setters: [
        function (constants_ts_10_1) {
          constants_ts_10 = constants_ts_10_1;
        },
        function (int32_ts_2_1) {
          int32_ts_2 = int32_ts_2_1;
        },
        function (integer_ts_1_1) {
          integer_ts_1 = integer_ts_1_1;
        },
        function (uint53_ts_2_1) {
          uint53_ts_2 = uint53_ts_2_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/date",
  ["randomjs/distribution/integer"],
  function (exports_17, context_17) {
    "use strict";
    var integer_ts_2;
    var __moduleName = context_17 && context_17.id;
    /**
     * Returns a Distribution that returns a random `Date` within the inclusive
     * range of [`start`, `end`].
     * @param start The minimum `Date`
     * @param end The maximum `Date`
     */
    function date(start, end) {
      const distribution = integer_ts_2.integer(+start, +end);
      return (engine) => new Date(distribution(engine));
    }
    exports_17("date", date);
    return {
      setters: [
        function (integer_ts_2_1) {
          integer_ts_2 = integer_ts_2_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/die",
  ["randomjs/distribution/integer"],
  function (exports_18, context_18) {
    "use strict";
    var integer_ts_3;
    var __moduleName = context_18 && context_18.id;
    /**
     * Returns a Distribution to return a value within [1, sideCount]
     * @param sideCount The number of sides of the die
     */
    function die(sideCount) {
      return integer_ts_3.integer(1, sideCount);
    }
    exports_18("die", die);
    return {
      setters: [
        function (integer_ts_3_1) {
          integer_ts_3 = integer_ts_3_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/dice",
  ["randomjs/distribution/die"],
  function (exports_19, context_19) {
    "use strict";
    var die_ts_1;
    var __moduleName = context_19 && context_19.id;
    /**
     * Returns a distribution that returns an array of length `dieCount` of values
     * within [1, `sideCount`]
     * @param sideCount The number of sides of each die
     * @param dieCount The number of dice
     */
    function dice(sideCount, dieCount) {
      const distribution = die_ts_1.die(sideCount);
      return (engine) => {
        const result = [];
        for (let i = 0; i < dieCount; ++i) {
          result.push(distribution(engine));
        }
        return result;
      };
    }
    exports_19("dice", dice);
    return {
      setters: [
        function (die_ts_1_1) {
          die_ts_1 = die_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/string",
  ["randomjs/distribution/integer"],
  function (exports_20, context_20) {
    "use strict";
    var integer_ts_4, DEFAULT_STRING_POOL;
    var __moduleName = context_20 && context_20.id;
    function string(pool = DEFAULT_STRING_POOL) {
      const poolLength = pool.length;
      if (!poolLength) {
        throw new Error("Expected pool not to be an empty string");
      }
      const distribution = integer_ts_4.integer(0, poolLength - 1);
      return (engine, length) => {
        let result = "";
        for (let i = 0; i < length; ++i) {
          const j = distribution(engine);
          result += pool.charAt(j);
        }
        return result;
      };
    }
    exports_20("string", string);
    return {
      setters: [
        function (integer_ts_4_1) {
          integer_ts_4 = integer_ts_4_1;
        },
      ],
      execute: function () {
        // tslint:disable:unified-signatures
        // has 2**x chars, for faster uniform distribution
        DEFAULT_STRING_POOL =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
      },
    };
  },
);
System.register(
  "randomjs/distribution/hex",
  ["randomjs/distribution/string"],
  function (exports_21, context_21) {
    "use strict";
    var string_ts_1, LOWER_HEX_POOL, lowerHex, upperHex;
    var __moduleName = context_21 && context_21.id;
    /**
     * Returns a Distribution that returns a random string comprised of numbers
     * or the characters `abcdef` (or `ABCDEF`) of length `length`.
     * @param length Length of the result string
     * @param uppercase Whether the string should use `ABCDEF` instead of `abcdef`
     */
    function hex(uppercase) {
      if (uppercase) {
        return upperHex;
      } else {
        return lowerHex;
      }
    }
    exports_21("hex", hex);
    return {
      setters: [
        function (string_ts_1_1) {
          string_ts_1 = string_ts_1_1;
        },
      ],
      execute: function () {
        LOWER_HEX_POOL = "0123456789abcdef";
        lowerHex = string_ts_1.string(LOWER_HEX_POOL);
        upperHex = string_ts_1.string(LOWER_HEX_POOL.toUpperCase());
      },
    };
  },
);
System.register(
  "randomjs/utils/convertSliceArgument",
  [],
  function (exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    function convertSliceArgument(value, length) {
      if (value < 0) {
        return Math.max(value + length, 0);
      } else {
        return Math.min(value, length);
      }
    }
    exports_22("convertSliceArgument", convertSliceArgument);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/utils/toInteger",
  [],
  function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    function toInteger(value) {
      const num = +value;
      if (num < 0) {
        return Math.ceil(num);
      } else {
        return Math.floor(num);
      }
    }
    exports_23("toInteger", toInteger);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/pick",
  [
    "randomjs/utils/convertSliceArgument",
    "randomjs/utils/toInteger",
    "randomjs/distribution/integer",
  ],
  function (exports_24, context_24) {
    "use strict";
    var convertSliceArgument_ts_1, toInteger_ts_1, integer_ts_5;
    var __moduleName = context_24 && context_24.id;
    /**
     * Returns a random value within the provided `source` within the sliced
     * bounds of `begin` and `end`.
     * @param source an array of items to pick from
     * @param begin the beginning slice index (defaults to `0`)
     * @param end the ending slice index (defaults to `source.length`)
     */
    function pick(engine, source, begin, end) {
      const length = source.length;
      if (length === 0) {
        throw new RangeError("Cannot pick from an empty array");
      }
      const start = begin == null ? 0
      : convertSliceArgument_ts_1.convertSliceArgument(
        toInteger_ts_1.toInteger(begin),
        length,
      );
      const finish = end === void 0
        ? length
        : convertSliceArgument_ts_1.convertSliceArgument(
          toInteger_ts_1.toInteger(end),
          length,
        );
      if (start >= finish) {
        throw new RangeError(
          `Cannot pick between bounds ${start} and ${finish}`,
        );
      }
      const distribution = integer_ts_5.integer(start, finish - 1);
      return source[distribution(engine)];
    }
    exports_24("pick", pick);
    return {
      setters: [
        function (convertSliceArgument_ts_1_1) {
          convertSliceArgument_ts_1 = convertSliceArgument_ts_1_1;
        },
        function (toInteger_ts_1_1) {
          toInteger_ts_1 = toInteger_ts_1_1;
        },
        function (integer_ts_5_1) {
          integer_ts_5 = integer_ts_5_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/utils/multiply",
  [],
  function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    function multiply(distribution, multiplier) {
      if (multiplier === 1) {
        return distribution;
      } else if (multiplier === 0) {
        return () => 0;
      } else {
        return (engine) => distribution(engine) * multiplier;
      }
    }
    exports_25("multiply", multiply);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/realZeroToOneExclusive",
  ["randomjs/utils/constants", "randomjs/distribution/uint53"],
  function (exports_26, context_26) {
    "use strict";
    var constants_ts_11, uint53_ts_3;
    var __moduleName = context_26 && context_26.id;
    /**
     * Returns a floating-point value within [0.0, 1.0)
     */
    function realZeroToOneExclusive(engine) {
      return uint53_ts_3.uint53(engine) /
        constants_ts_11.SMALLEST_UNSAFE_INTEGER;
    }
    exports_26("realZeroToOneExclusive", realZeroToOneExclusive);
    return {
      setters: [
        function (constants_ts_11_1) {
          constants_ts_11 = constants_ts_11_1;
        },
        function (uint53_ts_3_1) {
          uint53_ts_3 = uint53_ts_3_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/realZeroToOneInclusive",
  ["randomjs/utils/constants", "randomjs/distribution/uint53Full"],
  function (exports_27, context_27) {
    "use strict";
    var constants_ts_12, uint53Full_ts_2;
    var __moduleName = context_27 && context_27.id;
    /**
     * Returns a floating-point value within [0.0, 1.0]
     */
    function realZeroToOneInclusive(engine) {
      return uint53Full_ts_2.uint53Full(engine) /
        constants_ts_12.SMALLEST_UNSAFE_INTEGER;
    }
    exports_27("realZeroToOneInclusive", realZeroToOneInclusive);
    return {
      setters: [
        function (constants_ts_12_1) {
          constants_ts_12 = constants_ts_12_1;
        },
        function (uint53Full_ts_2_1) {
          uint53Full_ts_2 = uint53Full_ts_2_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/real",
  [
    "randomjs/utils/add",
    "randomjs/utils/multiply",
    "randomjs/distribution/realZeroToOneExclusive",
    "randomjs/distribution/realZeroToOneInclusive",
  ],
  function (exports_28, context_28) {
    "use strict";
    var add_ts_2,
      multiply_ts_1,
      realZeroToOneExclusive_ts_1,
      realZeroToOneInclusive_ts_1;
    var __moduleName = context_28 && context_28.id;
    /**
     * Returns a floating-point value within [min, max) or [min, max]
     * @param min The minimum floating-point value, inclusive.
     * @param max The maximum floating-point value.
     * @param inclusive If true, `max` will be inclusive.
     */
    function real(min, max, inclusive = false) {
      if (!isFinite(min)) {
        throw new RangeError("Expected min to be a finite number");
      } else if (!isFinite(max)) {
        throw new RangeError("Expected max to be a finite number");
      }
      return add_ts_2.add(
        multiply_ts_1.multiply(
          inclusive
            ? realZeroToOneInclusive_ts_1.realZeroToOneInclusive
            : realZeroToOneExclusive_ts_1.realZeroToOneExclusive,
          max - min,
        ),
        min,
      );
    }
    exports_28("real", real);
    return {
      setters: [
        function (add_ts_2_1) {
          add_ts_2 = add_ts_2_1;
        },
        function (multiply_ts_1_1) {
          multiply_ts_1 = multiply_ts_1_1;
        },
        function (realZeroToOneExclusive_ts_1_1) {
          realZeroToOneExclusive_ts_1 = realZeroToOneExclusive_ts_1_1;
        },
        function (realZeroToOneInclusive_ts_1_1) {
          realZeroToOneInclusive_ts_1 = realZeroToOneInclusive_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/utils/sliceArray",
  [],
  function (exports_29, context_29) {
    "use strict";
    var sliceArray;
    var __moduleName = context_29 && context_29.id;
    return {
      setters: [],
      execute: function () {
        exports_29("sliceArray", sliceArray = Array.prototype.slice);
      },
    };
  },
);
System.register(
  "randomjs/distribution/shuffle",
  ["randomjs/distribution/integer"],
  function (exports_30, context_30) {
    "use strict";
    var integer_ts_6;
    var __moduleName = context_30 && context_30.id;
    /**
     * Shuffles an array in-place
     * @param engine The Engine to use when choosing random values
     * @param array The array to shuffle
     * @param downTo minimum index to shuffle. Only used internally.
     */
    function shuffle(engine, array, downTo = 0) {
      const length = array.length;
      if (length) {
        for (let i = (length - 1) >>> 0; i > downTo; --i) {
          const distribution = integer_ts_6.integer(0, i);
          const j = distribution(engine);
          if (i !== j) {
            const tmp = array[i];
            array[i] = array[j];
            array[j] = tmp;
          }
        }
      }
      return array;
    }
    exports_30("shuffle", shuffle);
    return {
      setters: [
        function (integer_ts_6_1) {
          integer_ts_6 = integer_ts_6_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/distribution/sample",
  ["randomjs/utils/sliceArray", "randomjs/distribution/shuffle"],
  function (exports_31, context_31) {
    "use strict";
    var sliceArray_ts_1, shuffle_ts_1;
    var __moduleName = context_31 && context_31.id;
    /**
     * From the population array, produce an array with sampleSize elements that
     * are randomly chosen without repeats.
     * @param engine The Engine to use when choosing random values
     * @param population An array that has items to choose a sample from
     * @param sampleSize The size of the result array
     */
    function sample(engine, population, sampleSize) {
      if (
        sampleSize < 0 ||
        sampleSize > population.length ||
        !isFinite(sampleSize)
      ) {
        throw new RangeError(
          "Expected sampleSize to be within 0 and the length of the population",
        );
      }
      if (sampleSize === 0) {
        return [];
      }
      const clone = sliceArray_ts_1.sliceArray.call(population);
      const length = clone.length;
      if (length === sampleSize) {
        return shuffle_ts_1.shuffle(engine, clone, 0);
      }
      const tailLength = length - sampleSize;
      return shuffle_ts_1.shuffle(engine, clone, tailLength - 1).slice(
        tailLength,
      );
    }
    exports_31("sample", sample);
    return {
      setters: [
        function (sliceArray_ts_1_1) {
          sliceArray_ts_1 = sliceArray_ts_1_1;
        },
        function (shuffle_ts_1_1) {
          shuffle_ts_1 = shuffle_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/utils/stringRepeat",
  [],
  function (exports_32, context_32) {
    "use strict";
    var stringRepeat;
    var __moduleName = context_32 && context_32.id;
    return {
      setters: [],
      execute: function () {
        exports_32(
          "stringRepeat",
          stringRepeat = (() => {
            try {
              if ("x".repeat(3) === "xxx") {
                return (pattern, count) => pattern.repeat(count);
              }
            } catch (_) {
              // nothing to do here
            }
            return (pattern, count) => {
              let result = "";
              while (count > 0) {
                if (count & 1) {
                  result += pattern;
                }
                count >>= 1;
                pattern += pattern;
              }
              return result;
            };
          })(),
        );
      },
    };
  },
);
System.register(
  "randomjs/distribution/uuid4",
  ["randomjs/utils/stringRepeat"],
  function (exports_33, context_33) {
    "use strict";
    var stringRepeat_ts_1;
    var __moduleName = context_33 && context_33.id;
    function zeroPad(text, zeroCount) {
      return stringRepeat_ts_1.stringRepeat("0", zeroCount - text.length) +
        text;
    }
    /**
     * Returns a Universally Unique Identifier Version 4.
     *
     * See http://en.wikipedia.org/wiki/Universally_unique_identifier
     */
    function uuid4(engine) {
      const a = engine.next() >>> 0;
      const b = engine.next() | 0;
      const c = engine.next() | 0;
      const d = engine.next() >>> 0;
      return (zeroPad(a.toString(16), 8) +
        "-" +
        zeroPad((b & 0xffff).toString(16), 4) +
        "-" +
        zeroPad((((b >> 4) & 0x0fff) | 0x4000).toString(16), 4) +
        "-" +
        zeroPad(((c & 0x3fff) | 0x8000).toString(16), 4) +
        "-" +
        zeroPad(((c >> 4) & 0xffff).toString(16), 4) +
        zeroPad(d.toString(16), 8));
    }
    exports_33("uuid4", uuid4);
    return {
      setters: [
        function (stringRepeat_ts_1_1) {
          stringRepeat_ts_1 = stringRepeat_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "randomjs/Random",
  [
    "randomjs/distribution/bool",
    "randomjs/distribution/date",
    "randomjs/distribution/dice",
    "randomjs/distribution/die",
    "randomjs/distribution/hex",
    "randomjs/distribution/int32",
    "randomjs/distribution/int53",
    "randomjs/distribution/int53Full",
    "randomjs/distribution/integer",
    "randomjs/distribution/pick",
    "randomjs/distribution/real",
    "randomjs/distribution/realZeroToOneExclusive",
    "randomjs/distribution/realZeroToOneInclusive",
    "randomjs/distribution/sample",
    "randomjs/distribution/shuffle",
    "randomjs/distribution/string",
    "randomjs/distribution/uint32",
    "randomjs/distribution/uint53",
    "randomjs/distribution/uint53Full",
    "randomjs/distribution/uuid4",
    "randomjs/engine/nativeMath",
  ],
  function (exports_34, context_34) {
    "use strict";
    var bool_ts_1,
      date_ts_1,
      dice_ts_1,
      die_ts_2,
      hex_ts_1,
      int32_ts_3,
      int53_ts_2,
      int53Full_ts_2,
      integer_ts_7,
      pick_ts_1,
      real_ts_1,
      realZeroToOneExclusive_ts_2,
      realZeroToOneInclusive_ts_2,
      sample_ts_1,
      shuffle_ts_2,
      string_ts_2,
      uint32_ts_2,
      uint53_ts_4,
      uint53Full_ts_3,
      uuid4_ts_1,
      nativeMath_ts_2,
      Random;
    var __moduleName = context_34 && context_34.id;
    return {
      setters: [
        function (bool_ts_1_1) {
          bool_ts_1 = bool_ts_1_1;
        },
        function (date_ts_1_1) {
          date_ts_1 = date_ts_1_1;
        },
        function (dice_ts_1_1) {
          dice_ts_1 = dice_ts_1_1;
        },
        function (die_ts_2_1) {
          die_ts_2 = die_ts_2_1;
        },
        function (hex_ts_1_1) {
          hex_ts_1 = hex_ts_1_1;
        },
        function (int32_ts_3_1) {
          int32_ts_3 = int32_ts_3_1;
        },
        function (int53_ts_2_1) {
          int53_ts_2 = int53_ts_2_1;
        },
        function (int53Full_ts_2_1) {
          int53Full_ts_2 = int53Full_ts_2_1;
        },
        function (integer_ts_7_1) {
          integer_ts_7 = integer_ts_7_1;
        },
        function (pick_ts_1_1) {
          pick_ts_1 = pick_ts_1_1;
        },
        function (real_ts_1_1) {
          real_ts_1 = real_ts_1_1;
        },
        function (realZeroToOneExclusive_ts_2_1) {
          realZeroToOneExclusive_ts_2 = realZeroToOneExclusive_ts_2_1;
        },
        function (realZeroToOneInclusive_ts_2_1) {
          realZeroToOneInclusive_ts_2 = realZeroToOneInclusive_ts_2_1;
        },
        function (sample_ts_1_1) {
          sample_ts_1 = sample_ts_1_1;
        },
        function (shuffle_ts_2_1) {
          shuffle_ts_2 = shuffle_ts_2_1;
        },
        function (string_ts_2_1) {
          string_ts_2 = string_ts_2_1;
        },
        function (uint32_ts_2_1) {
          uint32_ts_2 = uint32_ts_2_1;
        },
        function (uint53_ts_4_1) {
          uint53_ts_4 = uint53_ts_4_1;
        },
        function (uint53Full_ts_3_1) {
          uint53Full_ts_3 = uint53Full_ts_3_1;
        },
        function (uuid4_ts_1_1) {
          uuid4_ts_1 = uuid4_ts_1_1;
        },
        function (nativeMath_ts_2_1) {
          nativeMath_ts_2 = nativeMath_ts_2_1;
        },
      ],
      execute: function () {
        // tslint:disable:unified-signatures
        /**
             * A wrapper around an Engine that provides easy-to-use methods for
             * producing values based on known distributions
             */
        Random = class Random {
          /**
                 * Creates a new Random wrapper
                 * @param engine The engine to use (defaults to a `Math.random`-based implementation)
                 */
          constructor(engine = nativeMath_ts_2.nativeMath) {
            this.engine = engine;
          }
          /**
                 * Returns a value within [-0x80000000, 0x7fffffff]
                 */
          int32() {
            return int32_ts_3.int32(this.engine);
          }
          /**
                 * Returns a value within [0, 0xffffffff]
                 */
          uint32() {
            return uint32_ts_2.uint32(this.engine);
          }
          /**
                 * Returns a value within [0, 0x1fffffffffffff]
                 */
          uint53() {
            return uint53_ts_4.uint53(this.engine);
          }
          /**
                 * Returns a value within [0, 0x20000000000000]
                 */
          uint53Full() {
            return uint53Full_ts_3.uint53Full(this.engine);
          }
          /**
                 * Returns a value within [-0x20000000000000, 0x1fffffffffffff]
                 */
          int53() {
            return int53_ts_2.int53(this.engine);
          }
          /**
                 * Returns a value within [-0x20000000000000, 0x20000000000000]
                 */
          int53Full() {
            return int53Full_ts_2.int53Full(this.engine);
          }
          /**
                 * Returns a value within [min, max]
                 * @param min The minimum integer value, inclusive. No less than -0x20000000000000.
                 * @param max The maximum integer value, inclusive. No greater than 0x20000000000000.
                 */
          integer(min, max) {
            return integer_ts_7.integer(min, max)(this.engine);
          }
          /**
                 * Returns a floating-point value within [0.0, 1.0]
                 */
          realZeroToOneInclusive() {
            return realZeroToOneInclusive_ts_2.realZeroToOneInclusive(
              this.engine,
            );
          }
          /**
                 * Returns a floating-point value within [0.0, 1.0)
                 */
          realZeroToOneExclusive() {
            return realZeroToOneExclusive_ts_2.realZeroToOneExclusive(
              this.engine,
            );
          }
          /**
                 * Returns a floating-point value within [min, max) or [min, max]
                 * @param min The minimum floating-point value, inclusive.
                 * @param max The maximum floating-point value.
                 * @param inclusive If true, `max` will be inclusive.
                 */
          real(min, max, inclusive = false) {
            return real_ts_1.real(min, max, inclusive)(this.engine);
          }
          bool(numerator, denominator) {
            return bool_ts_1.bool(numerator, denominator)(this.engine);
          }
          /**
                 * Return a random value within the provided `source` within the sliced
                 * bounds of `begin` and `end`.
                 * @param source an array of items to pick from
                 * @param begin the beginning slice index (defaults to `0`)
                 * @param end the ending slice index (defaults to `source.length`)
                 */
          pick(source, begin, end) {
            return pick_ts_1.pick(this.engine, source, begin, end);
          }
          /**
                 * Shuffles an array in-place
                 * @param array The array to shuffle
                 */
          shuffle(array) {
            return shuffle_ts_2.shuffle(this.engine, array);
          }
          /**
                 * From the population array, returns an array with sampleSize elements that
                 * are randomly chosen without repeats.
                 * @param population An array that has items to choose a sample from
                 * @param sampleSize The size of the result array
                 */
          sample(population, sampleSize) {
            return sample_ts_1.sample(this.engine, population, sampleSize);
          }
          /**
                 * Returns a value within [1, sideCount]
                 * @param sideCount The number of sides of the die
                 */
          die(sideCount) {
            return die_ts_2.die(sideCount)(this.engine);
          }
          /**
                 * Returns an array of length `dieCount` of values within [1, sideCount]
                 * @param sideCount The number of sides of each die
                 * @param dieCount The number of dice
                 */
          dice(sideCount, dieCount) {
            return dice_ts_1.dice(sideCount, dieCount)(this.engine);
          }
          /**
                 * Returns a Universally Unique Identifier Version 4.
                 *
                 * See http://en.wikipedia.org/wiki/Universally_unique_identifier
                 */
          uuid4() {
            return uuid4_ts_1.uuid4(this.engine);
          }
          string(length, pool) {
            return string_ts_2.string(pool)(this.engine, length);
          }
          /**
                 * Returns a random string comprised of numbers or the characters `abcdef`
                 * (or `ABCDEF`) of length `length`.
                 * @param length Length of the result string
                 * @param uppercase Whether the string should use `ABCDEF` instead of `abcdef`
                 */
          hex(length, uppercase) {
            return hex_ts_1.hex(uppercase)(this.engine, length);
          }
          /**
                 * Returns a random `Date` within the inclusive range of [`start`, `end`].
                 * @param start The minimum `Date`
                 * @param end The maximum `Date`
                 */
          date(start, end) {
            return date_ts_1.date(start, end)(this.engine);
          }
        };
        exports_34("Random", Random);
      },
    };
  },
);
System.register(
  "test_random",
  [
    "randomjs/engine/MersenneTwister19937",
    "randomjs/Random",
    "randomjs/engine/nativeMath",
  ],
  function (exports_35, context_35) {
    "use strict";
    var MersenneTwister19937_ts_1,
      Random_ts_1,
      nativeMath_ts_3,
      RandomTest,
      MersenneTwister19937Test,
      NativeMathTest;
    var __moduleName = context_35 && context_35.id;
    return {
      setters: [
        function (MersenneTwister19937_ts_1_1) {
          MersenneTwister19937_ts_1 = MersenneTwister19937_ts_1_1;
        },
        function (Random_ts_1_1) {
          Random_ts_1 = Random_ts_1_1;
        },
        function (nativeMath_ts_3_1) {
          nativeMath_ts_3 = nativeMath_ts_3_1;
        },
      ],
      execute: function () {
        RandomTest = class RandomTest {
          constructor(engine) {
            this.distribution = new Random_ts_1.Random(engine);
          }
          sample(n, min, max) {
            return Array.from(
              { length: n },
              () => this.distribution.real(min, max),
            );
          }
        };
        MersenneTwister19937Test = class MersenneTwister19937Test
          extends RandomTest {
          constructor() {
            super(MersenneTwister19937_ts_1.MersenneTwister19937.autoSeed());
          }
        };
        NativeMathTest = class NativeMathTest extends RandomTest {
          constructor() {
            super(nativeMath_ts_3.nativeMath);
          }
        };
        window.MersenneTwister19937Test = MersenneTwister19937Test;
        window.NativeMathTest = NativeMathTest;
      },
    };
  },
);

__instantiate("test_random");
