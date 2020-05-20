import * as c from "./linalg/core.ts";
import * as mcmc from "./bayesjs/mcmc.ts"

export class MultivariateNormal {
  mean: c.Vector;
  cov: c.Matrix;
  dim: number;
  constant: number;
//   logDet: number;
  inv: c.Matrix;
  constructor(mean: c.Vector, cov: c.Matrix) {
    this.dim = mean.dim;
    this.mean = mean;
    this.cov = cov;
    this.inv = cov.chol_inplace();
    this.constant = -0.5 * Math.log(2.0 * Math.PI) * this.dim;
  }

  static getSample(dim: number): c.Vector {
    var dist = new MultivariateNormal(c.Vector.zeros(dim), c.Eye(dim));
    return dist.getSample();
  }

  getSample(): c.Vector {
    let d = [...new Array(this.dim)].map(x => mcmc.rnorm(0, 1));
    var z = new c.Vector(d);
    let r = this.inv.multiply(z) as c.Vector;
    return this.mean.add(r);
  }
}

// MultivariateNormal.prototype.logDensity = function(x) {
//   var diff = this.mean.subtract(x);
//   return this.constant - this.logDet - 0.5 * (this.covL.bsolve_inplace(this.covL.fsolve_inplace(diff), {transpose: true})).norm2();
// };

// MultivariateNormal.prototype.gradLogDensity = function(x) {
//   var diff = x.subtract(this.mean);
//   // return this.cov.llt_solve(diff);
//   return this.covL.bsolve_inplace(this.covL.fsolve_inplace(diff), {transpose: true}).scale(-1);
// };

// MultivariateNormal.prototype.toString = function() {
//   return 'mean: ' + this.mean.transpose().toString() +
//     '\ncov:  \n' + this.cov.toString() +
//     '\ncovL: \n' + this.covL.toString() +
//     '\nlogDet: ' + this.logDet;

// };
