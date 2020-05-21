import * as math from "./math.ts";
import * as mcmc from "./bayesjs/mcmc.ts";

console.log(math.range(10));

console.log(math.rep([10, 10], 0));

let d = math.range(10).map((x) => mcmc.rnorm(0, 1));

console.log(d);
