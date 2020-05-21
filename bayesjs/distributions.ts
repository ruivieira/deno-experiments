/**
 * INFO: a collection of log probability density functions (PDF)
 */

// A number of log probability density functions (PDF). Naming and parameterization
// should match R's, except for that all functions reside in an ld object (
// as in "log density"), so to get a normal log density you would write
// ld.norm(...).
// Most of the code below is directly taken from the great Jstat project
// (https://github.com/jstat/) which includes PDF for many common probability
// distributions. What I have done is only to convert these to log PDFs.

/*
Original work Copyright (c) 2013 jStat
Modified work Copyright (c) 2015 Rasmus Bååth 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

////////// Helper functions //////////
//////////////////////////////////////

export function lgamma(x: number) {
  var j = 0;
  var cof = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.1208650973866179e-2,
    -0.5395239384953e-5,
  ];
  var ser = 1.000000000190015;
  var xx, y, tmp;
  tmp = (y = xx = x) + 5.5;
  tmp -= (xx + 0.5) * log(tmp);
  for (; j < 6; j++) {
    ser += cof[j] / ++y;
  }
  return log(2.5066282746310005 * ser / xx) - tmp;
}

export function lfactorial(n: number) {
  return n < 0 ? NaN : lgamma(n + 1);
}

export function lchoose(n: number, k: number) {
  return lfactorial(n) - lfactorial(k) - lfactorial(n - k);
}

export function lbeta(a: number, b: number) {
  return lgamma(a) + lgamma(b) - lgamma(a + b);
}

let log = Math.log;
let abs = Math.abs;
let pow = Math.pow;
let sqrt = Math.sqrt;
let pi = Math.PI;

////////// Continous distributions //////////
/////////////////////////////////////////////

export function beta(x: number, shape1: number, shape2: number) {
  if (x > 1 || x < 0) {
    return -Infinity;
  }
  if (shape1 === 1 && shape2 === 1) {
    return 0;
  } else {
    return (shape1 - 1) * log(x) + (shape2 - 1) * log(1 - x) -
      lbeta(shape1, shape2);
  }
}

export function cauchy(x: number, location: number, scale: number) {
  return log(scale) - log(pow(x - location, 2) + pow(scale, 2)) - log(pi);
}

export function norm(x: number, mean: number, sd: number) {
  return -0.5 * log(2 * pi) - log(sd) - pow(x - mean, 2) / (2 * sd * sd);
}// A bivariate Normal distribution parameterized by arrays of two means and SDs, and
// the correlation.

export function bivarnorm(x: any, mean: any, sd: any, corr: number) {
  var z = pow(x[0] - mean[0], 2) / pow(sd[0], 2) +
    pow(x[1] - mean[1], 2) / pow(sd[1], 2) -
    (2 * corr * (x[0] - mean[0]) * (x[1] - mean[1])) / (sd[0] * sd[1]);
  var normalizing_factor = -(log(2) + log(pi) + log(sd[0]) + log(sd[1]) +
    0.5 * log(1 - pow(corr, 2)));
  var bivar_log_dens = normalizing_factor - z / (2 * (1 - pow(corr, 2)));
  return bivar_log_dens;
}

export function laplace(x: number, location: number, scale: number) {
  return (-abs(x - location) / scale) - log(2 * scale);
}

let dexp = laplace;

export function gamma(x: number, shape: number, rate: number) {
  var scale = 1 / rate;
  if (x < 0) {
    return -Infinity;
  }
  if ((x === 0 && shape === 1)) {
    return -log(scale);
  } else {
    return (shape - 1) * log(x) - x / scale - lgamma(shape) -
      shape * log(scale);
  }
}

export function invgamma(x: number, shape: number, scale: number) {
  if (x <= 0) {
    return -Infinity;
  }
  return -(shape + 1) * log(x) - scale / x - lgamma(shape) + shape * log(scale);
}

export function lnorm(x: number, meanlog: number, sdlog: number) {
  if (x <= 0) {
    return -Infinity;
  }
  return -log(x) - 0.5 * log(2 * pi) - log(sdlog) -
    pow(log(x) - meanlog, 2) / (2 * sdlog * sdlog);
}

export function pareto(x: number, scale: number, shape: number) {
  if (x < scale) {
    return -Infinity;
  }
  return log(shape) + shape * log(scale) - (shape + 1) * log(x);
}

export function t(x: number, location: number, scale: number, df: number) {
  df = df > 1e100 ? 1e100 : df;
  return lgamma((df + 1) / 2) - lgamma(df / 2) - log(sqrt(pi * df) * scale) +
    log(pow(1 + (1 / df) * pow((x - location) / scale, 2), -(df + 1) / 2));
}// This is a direct javascript translation of the R code used to evaluate
// the log density of a weibull distribution:
// https://github.com/wch/r-source/blob/b156e3a711967f58131e23c1b1dc1ea90e2f0c43/src/nmath/dweibull.c

export function weibull(x: number, shape: number, scale: number) {
  if (x < 0) return -Infinity;
  if (x === 0 && shape < 1) return Infinity;
  var tmp1 = pow(x / scale, shape - 1);
  var tmp2 = tmp1 * (x / scale);
  return -tmp2 + log(shape * tmp1 / scale);
}// This is a direct javascript translation of the R code used to evaluate
// the log density of a logistic distribution:
// https://github.com/wch/r-source/blob/b156e3a711967f58131e23c1b1dc1ea90e2f0c43/src/nmath/dlogis.c

export function logis(x: number, location: number, scale: number) {
  x = abs((x - location) / scale);
  var e = Math.exp(-x);
  var f = 1.0 + e;
  return -(x + log(scale * f * f));
}

export function dirichlet(x: any, alpha: any) {
  var sum_alpha = 0;
  var sum_lgamma_alpha = 0;
  var sum_alpha_sub_1_log_x = 0;
  var n = alpha.length;
  for (var i = 0; i < n; i++) {
    sum_alpha += alpha[i];
    sum_lgamma_alpha += lgamma(alpha[i]);
    sum_alpha_sub_1_log_x += (alpha[i] - 1) * log(x[i]);
  }
  return lgamma(sum_alpha) - sum_lgamma_alpha + sum_alpha_sub_1_log_x;
}

export function exp(x: number, rate: number) {
  return x < 0 ? -Infinity : log(rate) - rate * x;
}

export function unif(x: number, min: number, max: number) {
  return (x < min || x > max) ? -Infinity : log(1 / (max - min));
}////////// Discrete distributions //////////
////////////////////////////////////////////

export function bern(x: number, prob: number) {
  return !(x === 0 || x === 1)
    ? -Infinity
    : log(x * prob + (1 - x) * (1 - prob));
}

export function cat(x: number, probs: any) {
  if (x < 1 || x > probs.length) {
    return -Infinity;
  } else {
    return log(probs[x - 1]);
  }
}

export function binom(x: number, size: number, prob: number) {
  if (x > size || x < 0) {
    return -Infinity;
  }
  if (prob === 0 || prob === 1) {
    return (size * prob) === x ? 0 : -Infinity;
  }
  return lchoose(size, x) + x * log(prob) + (size - x) * log(1 - prob);
}

export function ultinom(x: any, probs: any) {
  var n = x.length;
  var size = 0;
  var tmp_term = 0;
  for (var i = 0; i < n; i++) {
    if (probs[i] === 0) {
      if (x[i] !== 0) {
        return -Infinity;
      }
    } else {
      size += x[i];
      tmp_term += x[i] * log(probs[i]) - lgamma(x[i] + 1);
    }
  }
  return lgamma(size + 1) + tmp_term;
}

export function nbinom(x: number, size: number, prob: number) {
  if (x < 0) {
    return -Infinity;
  }
  return lchoose(x + size - 1, size - 1) + x * log(1 - prob) + size * log(prob);
}

export function hyper(x: number, m: number, n: number, k: number) {
  if (x < 0 || x > k) {
    return -Infinity;
  } else {
    return lchoose(m, x) + lchoose(n, k - x) - lchoose(m + n, k);
  }
}

export function pois(x: number, lambda: number) {
  return x < 0 ? -Infinity : log(lambda) * x - lambda - lfactorial(x);
}
