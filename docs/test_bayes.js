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

/**
 * INFO: A collection of log probability density functions (PDF)
 */
System.register("bayesjs/distributions", [], function (exports_1, context_1) {
  "use strict";
  var log, abs, pow, sqrt, pi, dexp;
  var __moduleName = context_1 && context_1.id;
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
  function lgamma(x) {
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
  exports_1("lgamma", lgamma);
  function lfactorial(n) {
    return n < 0 ? NaN : lgamma(n + 1);
  }
  exports_1("lfactorial", lfactorial);
  function lchoose(n, k) {
    return lfactorial(n) - lfactorial(k) - lfactorial(n - k);
  }
  exports_1("lchoose", lchoose);
  function lbeta(a, b) {
    return lgamma(a) + lgamma(b) - lgamma(a + b);
  }
  exports_1("lbeta", lbeta);
  ////////// Continous distributions //////////
  /////////////////////////////////////////////
  function beta(x, shape1, shape2) {
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
  exports_1("beta", beta);
  function cauchy(x, location, scale) {
    return log(scale) - log(pow(x - location, 2) + pow(scale, 2)) - log(pi);
  }
  exports_1("cauchy", cauchy);
  function norm(x, mean, sd) {
    return -0.5 * log(2 * pi) - log(sd) - pow(x - mean, 2) / (2 * sd * sd);
  } // A bivariate Normal distribution parameterized by arrays of two means and SDs, and
  exports_1("norm", norm);
  // the correlation.
  function bivarnorm(x, mean, sd, corr) {
    var z = pow(x[0] - mean[0], 2) / pow(sd[0], 2) +
      pow(x[1] - mean[1], 2) / pow(sd[1], 2) -
      (2 * corr * (x[0] - mean[0]) * (x[1] - mean[1])) / (sd[0] * sd[1]);
    var normalizing_factor = -(log(2) + log(pi) + log(sd[0]) + log(sd[1]) +
      0.5 * log(1 - pow(corr, 2)));
    var bivar_log_dens = normalizing_factor - z / (2 * (1 - pow(corr, 2)));
    return bivar_log_dens;
  }
  exports_1("bivarnorm", bivarnorm);
  function laplace(x, location, scale) {
    return (-abs(x - location) / scale) - log(2 * scale);
  }
  exports_1("laplace", laplace);
  function gamma(x, shape, rate) {
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
  exports_1("gamma", gamma);
  function invgamma(x, shape, scale) {
    if (x <= 0) {
      return -Infinity;
    }
    return -(shape + 1) * log(x) - scale / x - lgamma(shape) +
      shape * log(scale);
  }
  exports_1("invgamma", invgamma);
  function lnorm(x, meanlog, sdlog) {
    if (x <= 0) {
      return -Infinity;
    }
    return -log(x) - 0.5 * log(2 * pi) - log(sdlog) -
      pow(log(x) - meanlog, 2) / (2 * sdlog * sdlog);
  }
  exports_1("lnorm", lnorm);
  function pareto(x, scale, shape) {
    if (x < scale) {
      return -Infinity;
    }
    return log(shape) + shape * log(scale) - (shape + 1) * log(x);
  }
  exports_1("pareto", pareto);
  function t(x, location, scale, df) {
    df = df > 1e100 ? 1e100 : df;
    return lgamma((df + 1) / 2) - lgamma(df / 2) - log(sqrt(pi * df) * scale) +
      log(pow(1 + (1 / df) * pow((x - location) / scale, 2), -(df + 1) / 2));
  } // This is a direct javascript translation of the R code used to evaluate
  exports_1("t", t);
  // the log density of a weibull distribution:
  // https://github.com/wch/r-source/blob/b156e3a711967f58131e23c1b1dc1ea90e2f0c43/src/nmath/dweibull.c
  function weibull(x, shape, scale) {
    if (x < 0) {
      return -Infinity;
    }
    if (x === 0 && shape < 1) {
      return Infinity;
    }
    var tmp1 = pow(x / scale, shape - 1);
    var tmp2 = tmp1 * (x / scale);
    return -tmp2 + log(shape * tmp1 / scale);
  } // This is a direct javascript translation of the R code used to evaluate
  exports_1("weibull", weibull);
  // the log density of a logistic distribution:
  // https://github.com/wch/r-source/blob/b156e3a711967f58131e23c1b1dc1ea90e2f0c43/src/nmath/dlogis.c
  function logis(x, location, scale) {
    x = abs((x - location) / scale);
    var e = Math.exp(-x);
    var f = 1.0 + e;
    return -(x + log(scale * f * f));
  }
  exports_1("logis", logis);
  function dirichlet(x, alpha) {
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
  exports_1("dirichlet", dirichlet);
  function exp(x, rate) {
    return x < 0 ? -Infinity : log(rate) - rate * x;
  }
  exports_1("exp", exp);
  function unif(x, min, max) {
    return (x < min || x > max) ? -Infinity : log(1 / (max - min));
  } ////////// Discrete distributions //////////
  exports_1("unif", unif);
  ////////////////////////////////////////////
  function bern(x, prob) {
    return !(x === 0 || x === 1)
      ? -Infinity
      : log(x * prob + (1 - x) * (1 - prob));
  }
  exports_1("bern", bern);
  function cat(x, probs) {
    if (x < 1 || x > probs.length) {
      return -Infinity;
    } else {
      return log(probs[x - 1]);
    }
  }
  exports_1("cat", cat);
  function binom(x, size, prob) {
    if (x > size || x < 0) {
      return -Infinity;
    }
    if (prob === 0 || prob === 1) {
      return (size * prob) === x ? 0 : -Infinity;
    }
    return lchoose(size, x) + x * log(prob) + (size - x) * log(1 - prob);
  }
  exports_1("binom", binom);
  function ultinom(x, probs) {
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
  exports_1("ultinom", ultinom);
  function nbinom(x, size, prob) {
    if (x < 0) {
      return -Infinity;
    }
    return lchoose(x + size - 1, size - 1) + x * log(1 - prob) +
      size * log(prob);
  }
  exports_1("nbinom", nbinom);
  function hyper(x, m, n, k) {
    if (x < 0 || x > k) {
      return -Infinity;
    } else {
      return lchoose(m, x) + lchoose(n, k - x) - lchoose(m + n, k);
    }
  }
  exports_1("hyper", hyper);
  function pois(x, lambda) {
    return x < 0 ? -Infinity : log(lambda) * x - lambda - lfactorial(x);
  }
  exports_1("pois", pois);
  return {
    setters: [],
    execute: function () {
      log = Math.log;
      abs = Math.abs;
      pow = Math.pow;
      sqrt = Math.sqrt;
      pi = Math.PI;
      dexp = laplace;
    },
  };
});
/**
 * INFO: A port of `bayes.js` to Deno
 */
////////// Helper Functions //////////
//////////////////////////////////////
System.register("bayesjs/mcmc", [], function (exports_2, context_2) {
  "use strict";
  var get_multidim_option,
    param_init_fixed,
    complete_params,
    Stepper,
    OnedimMetropolisStepper,
    normal_proposal,
    RealMetropolisStepper,
    discrete_normal_proposal,
    IntMetropolisStepper,
    MultidimComponentMetropolisStepper,
    MultiRealComponentMetropolisStepper,
    MultiIntComponentMetropolisStepper,
    BinaryStepper,
    BinaryComponentStepper,
    ParameterType,
    AmwgStepper,
    Sampler,
    AmwgSampler;
  var __moduleName = context_2 && context_2.id;
  /** Returns a random real number between min and max */
  function runif(min, max) {
    return Math.random() * (max - min) + min;
  } /** Returns a random integer between min and max */
  exports_2("runif", runif);
  function runif_discrete(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } /** Returns a random real number from a normal distribbution defined
       *  by mean and sd.
       *  Adapted from https://github.com/jstat/jstat/blob/master/src/special.js */

  exports_2("runif_discrete", runif_discrete);
  function rnorm(mean, sd) {
    var u, v, x, y, q;
    do {
      u = Math.random();
      v = 1.7156 * (Math.random() - 0.5);
      x = u - 0.449871;
      y = Math.abs(v) + 0.386595;
      q = x * x + y * (0.19600 * y - 0.25472 * x);
    } while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));
    return (v / u) * sd + mean;
  } /** Returns a deep clone of src, sort of... It only copies a limited
       * number of types and, for example, function are not copied.
       * From http://davidwalsh.name/javascript-clone
       */

  exports_2("rnorm", rnorm);
  function deep_clone(src) {
    function mixin(dest, source, copyFunc) {
      var name, s, i, empty = Object.create(null);
      for (name in source) {
        // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
        // inherited from Object.prototype.	 For example, if dest has a custom toString() method,
        // don't overwrite it with the toString() method that source inherited from Object.prototype
        s = source[name];
        if (
          !(name in dest) ||
          (dest[name] !== s && (!(name in empty) || empty[name] !== s))
        ) {
          dest[name] = copyFunc ? copyFunc(s) : s;
        }
      }
      return dest;
    }
    if (
      !src || typeof src != "object" ||
      Object.prototype.toString.call(src) === "[object Function]"
    ) {
      // null, undefined, any non-object, or function
      return src; // anything
    }
    if (src.nodeType && "cloneNode" in src) {
      // DOM Node
      return src.cloneNode(true); // Node
    }
    if (src instanceof Date) {
      // Date
      return new Date(src.getTime()); // Date
    }
    if (src instanceof RegExp) {
      // RegExp
      return new RegExp(src); // RegExp
    }
    var r, i, l;
    if (src instanceof Array) {
      // array
      r = [];
      for (i = 0, l = src.length; i < l; ++i) {
        if (i in src) {
          r.push(deep_clone(src[i]));
        }
      }
    } else {
      // generic objects
      r = src.constructor ? new src.constructor() : {};
    }
    return mixin(r, src, deep_clone);
  } /** Specialized clone function that only clones scalars and nested arrays where
       * each array either consists of all arrays or all numbers. This function
       * is meant as a fast way of cloning parameter draws within the mcmc sampling
       * loop.
       */

  exports_2("deep_clone", deep_clone);
  function clone_param_draw(x) {
    if (Array.isArray(x)) {
      if (Array.isArray(x[0])) {
        // x is an array of arrays so we need to clone it recursively
        var x_copy = [];
        for (var i = 0, length = x.length; i < length; i++) {
          x_copy.push(clone_param_draw(x[i]));
        }
        return x_copy;
      } else { // We'll assume x is a arrays of scalars
        return x.slice(0);
      }
    } else { // We'll assume x is a scalar
      return x;
    }
  } /** Returns true if object is a number.
       */

  function is_number(object) {
    return typeof object == "number" ||
      (typeof object == "object" && object.constructor === Number);
  } /**
       * Creates and initializes a (possibly multidimensional/nested) array.
       * @param dim - An array giving the dimension of the array. For example,
       *   [5] would yield a 5 element array, and [3,3] would yield a 3 by 3 matrix.
       * @param init - A value or a function used to fill in the each element in
       *   the array. If it is a function it should take no arguments, it will be
       *   evaluated once for each element, and it's return value will be used to
       *   fill in each element.
       * @example
       * // The following would return [[1,1],[1,1],[1,1]]
       * create_array([2,3], 1)
       */

  function create_array(dim, init) {
    var arr = new Array(dim[0]);
    var i;
    if (dim.length == 1) { // Fill it up with init
      if (typeof init === "function") {
        for (i = 0; i < dim[0]; i++) {
          arr[i] = init();
        }
      } else {
        for (i = 0; i < dim[0]; i++) {
          arr[i] = init;
        }
      }
    } else if (dim.length > 1) {
      for (i = 0; i < dim[0]; i++) {
        arr[i] = create_array(dim.slice(1), init);
      }
    } else {
      throw "create_array can't create a dimensionless array";
    }
    return arr;
  } /**
       * Return the dimensions of a possibly nested array as an array. For
       * example, array_dim( [[1, 2], [1, 2]] ) should return [2, 2]
       * Assumes that all arrays inside another array are of the same length.
       * @example
       * // Should return [4, 2, 1]
       * array_dim(create_array([4, 2, 1], 0))
       */

  function array_dim(a) {
    if (Array.isArray(a[0])) {
      return [a.length].concat(array_dim(a[0]));
    } else {
      return [a.length];
    }
  } /**
       * Checks if two arrays are equal in the sense that they contain the same elements
       * as judged by the "==" operator. Returns true or false.
       * Adapted from http://stackoverflow.com/a/14853974/1001848
       */

  function array_equal(a1, a2) {
    if (a1.length != a2.length) {
      return false;
    }
    for (var i = 0; i < a1.length; i++) {
      // Check if we have nested arrays
      if (Array.isArray(a1[i]) && Array.isArray(a2[i])) {
        // recurse into the nested arrays
        if (!array_equal(a1[i], a2[i])) {
          return false;
        }
      } else if (a1[i] != a2[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  } /**
       * Traverses a possibly nested array a and applies fun to all "leaf nodes",
       * that is, values that are not arrays. Returns an array of the same size as
       * a.
       */

  function nested_array_apply(a, fun) {
    if (Array.isArray(a)) {
      var result = new Array(a.length);
      for (var i = 0; i < a.length; i++) {
        result[i] = nested_array_apply(a[i], fun);
      }
      return result;
    } else {
      return fun(a);
    }
  } /** Randomizing the array element order in-place. Using Durstenfeld
       * shuffle algorithm. Adapted from here:
       * http://stackoverflow.com/a/12646864/1001848
       */

  function shuffle_array(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
  /**
       * Does the same thing as nested_array_apply, that is, traverses a possibly
       * nested array a and applies fun to all "leaf nodes" and returns an array
       * of the same size as a. The difference is that nested_array_random_apply
       * branches randomly.
       */
  function nested_array_random_apply(a, fun) {
    if (Array.isArray(a)) {
      var len = a.length;
      var i;
      var array_is = [];
      for (i = 0; i < len; i++) {
        array_is[i] = i;
      }
      shuffle_array(array_is);
      var result = [];
      for (i = 0; i < len; i++) {
        var array_i = array_is[i];
        result[array_i] = nested_array_apply(a[array_i], fun);
      }
      return result;
    } else {
      return fun(a);
    }
  } /**
       * Allows a pretty way of setting default options where the defults can be
       * overridden by an options object.
       *  @param option_name - the name of the option as a string
       *  @param my_options - an option object that could have option_name
       *    as a member.
       * @param defaul_value - defult value that is returned if option_name
       *   is not defined in my_options.
       * @example
       * var my_options = {pi: 3.14159}
       * var pi = get_option("pi", my_options, 3.14)
       */

  // Pretty way of setting default options where the defaults can be overridden
  // by an options object. For example:
  // var pi = get_option("pi", my_options, 3.14)
  function get_option(option_name, options, defaul_value) {
    options = options || {};
    return options.hasOwnProperty(option_name) &&
      options[option_name] !== undefined &&
      options[option_name] !== null
      ? options[option_name]
      : defaul_value;
  } /** Version of get_option where the option should be a one or multi-dimensional
       * array and where the default can be overridden either by a scalar or by an array.
       * If it's a scalar the that scalar is used to initialize an array with
       * dim dimensions.
       *
       */

  return {
    setters: [],
    execute: function () {
      get_multidim_option = function (option_name, options, dim, defaul_value) {
        var value = get_option(option_name, options, defaul_value);
        if (!Array.isArray(value)) {
          value = create_array(dim, value);
        }
        if (!array_equal(array_dim(value), dim)) {
          throw "The option " + option_name + " is of dimension [" +
            array_dim(value) + "] but should be [" + dim + "].";
        }
        return value;
      };
      ////////// Functions for handling parameter objects //////////
      //////////////////////////////////////////////////////////////
      /**
               * Returns a fixed (same every time) number that could be used to initialize
               * a parameter of a certain type, possibly with lower and upper bounds.
               * The possile types are "real", "int", and "binary".
               */
      param_init_fixed = function (type, lower, upper) {
        if (lower > upper) {
          throw "Can not initialize parameter where lower bound > upper bound";
        }
        if (type == ParameterType.Real) {
          if (lower === -Infinity && upper === Infinity) {
            return 0.5;
          } else if (lower === -Infinity) {
            return upper - 0.5;
          } else if (upper === Infinity) {
            return lower + 0.5;
          } else if (lower <= upper) {
            return (lower + upper) / 2;
          }
        } else if (type == ParameterType.Int) {
          if (lower === -Infinity && upper === Infinity) {
            return 1;
          } else if (lower === -Infinity) {
            return upper - 1;
          } else if (upper === Infinity) {
            return lower + 1;
          } else if (lower <= upper) {
            return Math.round((lower + upper) / 2);
          }
        } else if (type == ParameterType.Binary) {
          return 1;
        }
        throw "Could not initialize parameter of type " + type + "[" + lower +
          ", " +
          upper + "]";
      };
      /**
               * Completes params_to_complete, an object containing parameter descriptions,
               * and initializes non-initialized parameters. This modified version of
               * params_to_complete is returned as a deep copy and not modified in place.
               * Initialization is done by supplying a param_init function with signature
               * function(type, lower, upper) that should return a single number
               * (like param_init_fixed, for example).
               * @example
               * var params = { "mu": {"type": "real"} }
               * params = complete_params(params);
               * // params should now be:
               * //  {"mu": { "type": "real", "dim": [1], "upper": Infinity,
               * //           "lower": -Infinity, "init": 0.5 }}
               */
      complete_params = function (params_to_complete, param_init) {
        var params = deep_clone(params_to_complete);
        for (var param_name in params) {
          if (!params.hasOwnProperty(param_name)) {
            continue;
          }
          var param = params[param_name];
          if (!param.hasOwnProperty("type")) {
            param.type = ParameterType.Real;
          }
          if (!param.hasOwnProperty("dim")) {
            param.dim = [1];
          }
          if (is_number(param.dim)) {
            param.dim = [param.dim];
          }
          if (param.type == ParameterType.Binary) {
            param.upper = 1;
            param.lower = 0;
          }
          if (!param.hasOwnProperty("upper")) {
            param.upper = Infinity;
          }
          if (!param.hasOwnProperty("lower")) {
            param.lower = -Infinity;
          }
          if (param.hasOwnProperty("init")) {
            // If this is just a number or a nested array we leave it alone, but if...
            if (
              array_equal(param.dim, [1]) && typeof param.init === "function"
            ) {
              // param.init is a function, use that to initialize the parameter.
              param.init = param.init();
            } else if (
              !array_equal(param.dim, [1]) && !Array.isArray(param.init)
            ) {
              // We have a multidimensional parameter where the param.init exist but
              // is not an array. Then assume it is a number or a function and use
              // it to initialize the parameter.
              param.init = create_array(param.dim, param.init);
            }
          } else { // We use the default initialization function.
            if (array_equal(param.dim, [1])) {
              param.init = param_init(param.type, param.lower, param.upper);
            } else {
              param.init = create_array(param.dim, function () {
                return param_init(param.type, param.lower, param.upper);
              });
            }
          }
        }
        return params;
      };
      ////////// Stepper Functions ///////////
      ////////////////////////////////////////
      /**
               * @interface
               * A Stepper is an object responsible for pushing around one
               * or more parameter values in a state according to the distribution
               * defined by the log posterior. This defines the Stepper "interface",
               * where "interface" means that Stepper defines a class that is never
               * meant to be instantiated, but just to be subclassed by specialized
               * stepper functions.
               * @interface
               * @param params - An object with parameter definitions, for example:
               *   {"mu": { "type": "real", "dim": [1], "upper": Infinity,
               *   "lower": -Infinity, "init": 0.5 }}
               *   The parameter definitions are expected to be "complete", that is,
               *   specifying all relevant attributes such as dim, lower and upper.
               * @param state - an object containing the state of all parameters in params
               *   (and possibly more). The parameter names are given as keys and the states
               *   as scalars or, possibly nested, arrays. For example:
               *   {mu: 10, sigma: 5, beta: [1, 2.5]}
               * @param log_post - A function *taking no parameters* that returns the
               *   log density that depends on the state. That is, the value of log_post
               *   should change if the the values in state are changed.
              
               */
      Stepper = class Stepper {
        constructor(params, state, log_post) {
          this.params = params;
          this.state = state;
          this.log_post = log_post;
        }
        /**
                 * If implemented, makes the stepper adapt while stepping.
                 */
        start_adaptation() {
        }
        /**
                 * If implemented, makes the stepper cease adapting while stepping.
                 */
        stop_adaptation() {
          // Optional, some steppers might not be adaptive. */
        }
      };
      /**
               * @class
               * @implements {Stepper}
               * Constructor for an object that implements the metropolis step in
               * the Adaptive Metropolis-Within-Gibbs algorithm in "Examples of Adaptive MCMC"
               * by Roberts and Rosenthal (2008).
               * @param params - An object with a single parameter definition.
               * @param state - an object containing the state of all parameters.
               * @param log_post - A function that returns the log density that depends on the state.
               * @param options - an object with options to the stepper.
               * @param generate_proposal - a function returning a proposal (as a number)
               * with signature function(param_state, log_scale) where param_state is a
               * number and log_scale defines the scale of the proposal somehow.
              */
      OnedimMetropolisStepper = class OnedimMetropolisStepper extends Stepper {
        constructor(params, state, log_post, options, generate_proposal) {
          super(params, state, log_post);
          var param_names = Object.keys(this.params);
          if (param_names.length != 1) {
            throw "OnedimMetropolisStepper can only handle one parameter.";
          }
          this.param_name = param_names[0];
          var param = this.params[this.param_name];
          if (!array_equal(param.dim, [1])) {
            throw "OnedimMetropolisStepper can only handle one one-dimensional parameter.";
          }
          this.lower = param.lower;
          this.upper = param.upper;
          this.prop_log_scale = get_option("prop_log_scale", options, 0);
          this.batch_size = get_option("batch_size", options, 50);
          this.max_adaptation = get_option("max_adaptation", options, 0.33);
          this.initial_adaptation = get_option(
            "initial_adaptation",
            options,
            1.0,
          );
          this.target_accept_rate = get_option(
            "target_accept_rate",
            options,
            0.44,
          );
          this.is_adapting = get_option("is_adapting", options, true);
          this.generate_proposal = generate_proposal;
          this.acceptance_count = 0;
          this.batch_count = 0;
          this.iterations_since_adaption = 0;
        }
        step() {
          var param_state = this.state[this.param_name];
          var param_proposal = this.generate_proposal(
            param_state,
            this.prop_log_scale,
          );
          if (param_proposal < this.lower || param_proposal > this.upper) {
            // Outside of limits of the parameter, reject the proposal
            // and stay at the current state.
          } else { // make a Metropolis step
            var curr_log_dens = this.log_post();
            this.state[this.param_name] = param_proposal;
            var prop_log_dens = this.log_post();
            var accept_prob = Math.exp(prop_log_dens - curr_log_dens);
            if (accept_prob > Math.random()) {
              // We do nothing as the state of param has already been changed to the proposal
              if (this.is_adapting) {
                this.acceptance_count++;
              }
            } else {
              // revert state back to the old state of param
              this.state[this.param_name] = param_state;
            }
          }
          if (this.is_adapting) {
            this.iterations_since_adaption++;
            if (this.iterations_since_adaption >= this.batch_size) { // then adapt
              this.batch_count++;
              var log_sd_adjustment = Math.min(
                this.max_adaptation,
                this.initial_adaptation / Math.sqrt(this.batch_count),
              );
              if (
                this.acceptance_count / this.batch_size >
                  this.target_accept_rate
              ) {
                this.prop_log_scale += log_sd_adjustment;
              } else {
                this.prop_log_scale -= log_sd_adjustment;
              }
              this.acceptance_count = 0;
              this.iterations_since_adaption = 0;
            }
          }
          return this.state[this.param_name];
        }
        start_adaptation() {
          this.is_adapting = true;
        }
        stop_adaptation() {
          this.is_adapting = false;
        }
        info() {
          return {
            prop_log_scale: this.prop_log_scale,
            is_adapting: this.is_adapting,
            acceptance_count: this.acceptance_count,
            iterations_since_adaption: this.iterations_since_adaption,
            batch_count: this.batch_count,
          };
        }
      };
      exports_2("OnedimMetropolisStepper", OnedimMetropolisStepper);
      /**
               * Function returning a Normal proposal.
               */
      normal_proposal = function (param_state, prop_log_scale) {
        return rnorm(param_state, Math.exp(prop_log_scale));
      };
      /**
               * @class
               * @augments {OnedimMetropolisStepper}
               * A "subclass" of OnedimMetropolisStepper making continous Normal proposals.
               */
      RealMetropolisStepper = class RealMetropolisStepper
        extends OnedimMetropolisStepper {
        constructor(params, state, log_post, options) {
          super(params, state, log_post, options, normal_proposal);
        }
      };
      /**
               * Function returning a discretized Normal proposal.
               */
      discrete_normal_proposal = function (param_state, prop_log_scale) {
        return Math.round(rnorm(param_state, Math.exp(prop_log_scale)));
      };
      /**
               * @class
               * @augments {OnedimMetropolisStepper}
               * A "subclass" of OnedimMetropolisStepper making discretized Normal proposals.
               */
      IntMetropolisStepper = class IntMetropolisStepper
        extends OnedimMetropolisStepper {
        constructor(params, state, log_post, options) {
          super(params, state, log_post, options, discrete_normal_proposal);
        }
      };
      /**
               * @class
               * @implements {Stepper}
               * Constructor for an object that implements the metropolis step in
               * the Adaptive Metropolis-Within-Gibbs algorithm in "Examples of Adaptive MCMC"
               * by Roberts and Rosenthal (2008) for possibly multidimensional arrays. That
               * is, instead of just taking a step for a one-dimensional parameter like
               * OnedimMetropolisStepper, this Stepper is responsible for taking steps
               * for a multidimensional array. It's still pretty dumb and just takes
               * one-dimensional steps for each parameter component, though.
               * @param params - An object with a single parameter definition for a
               *   multidimensional parameter.
               * @param state - an object containing the state of all parameters.
               * @param log_post - A function that returns the log density that depends on the state.
               * @param options - an object with options to the stepper.
               * @param SubStepper - a constructor for the type of one dimensional Stepper to apply on
               *   all the components of the multidimensional parameter.
              */
      MultidimComponentMetropolisStepper =
          class MultidimComponentMetropolisStepper extends Stepper {
            constructor(params, state, log_post, options, SubStepper) {
              super(params, state, log_post);
              var param_names = Object.keys(this.params);
              if (param_names.length != 1) {
                throw "MultidimComponentMetropolisStepper can't handle more than one parameter.";
              }
              this.param_name = param_names[0];
              var param = this.params[this.param_name];
              this.lower = param.lower;
              this.upper = param.upper;
              this.dim = param.dim;
              this.prop_log_scale = get_multidim_option(
                "prop_log_scale",
                options,
                this.dim,
                0,
              );
              this.batch_size = get_multidim_option(
                "batch_size",
                options,
                this.dim,
                50,
              );
              this.max_adaptation = get_multidim_option(
                "max_adaptation",
                options,
                this.dim,
                0.33,
              );
              this.initial_adaptation = get_multidim_option(
                "initial_adaptation",
                options,
                this.dim,
                1.0,
              );
              this.target_accept_rate = get_multidim_option(
                "target_accept_rate",
                options,
                this.dim,
                0.44,
              );
              this.is_adapting = get_multidim_option(
                "is_adapting",
                options,
                this.dim,
                true,
              );
              // This hack below is a recursive function that creates an array of
              // one dimensional steppers according to dim.
              var create_substeppers = function (
                dim,
                substate,
                log_post,
                prop_log_scale,
                batch_size,
                max_adaptation,
                initial_adaptation,
                target_accept_rate,
                is_adapting,
              ) {
                var substeppers = [];
                if (dim.length === 1) {
                  for (var i = 0; i < dim[0]; i++) {
                    var suboptions = {
                      prop_log_scale: prop_log_scale[i],
                      batch_size: batch_size[i],
                      max_adaptation: max_adaptation[i],
                      initial_adaptation: initial_adaptation[i],
                      target_accept_rate: target_accept_rate[i],
                      is_adapting: is_adapting[i],
                    };
                    var subparam = {};
                    subparam[i] = deep_clone(param);
                    subparam[i].dim = [1]; // As this should now be a one-dim parameter
                    delete subparam[i].init; // As it sould not be needed
                    substeppers[i] = new SubStepper(
                      subparam,
                      substate,
                      log_post,
                      suboptions,
                    );
                  }
                } else {
                  for (var i = 0; i < dim[0]; i++) {
                    substeppers[i] = create_substeppers(
                      dim.slice(1),
                      substate[i],
                      log_post,
                      prop_log_scale[i],
                      batch_size[i],
                      max_adaptation[i],
                      initial_adaptation[i],
                      target_accept_rate[i],
                      is_adapting[i],
                    );
                  }
                }
                return substeppers;
              };
              this.substeppers = create_substeppers(
                this.dim,
                this.state[this.param_name],
                this.log_post,
                this.prop_log_scale,
                this.batch_size,
                this.max_adaptation,
                this.initial_adaptation,
                this.target_accept_rate,
                this.is_adapting,
              );
            }
            step() {
              // Go through the substeppers in a random order and call step() on them.
              return nested_array_random_apply(
                this.substeppers,
                function (substepper) {
                  return substepper.step();
                },
              );
            }
            start_adaptation() {
              nested_array_apply(this.substeppers, function (substepper) {
                substepper.start_adaptation();
              });
            }
            stop_adaptation() {
              nested_array_apply(this.substeppers, function (substepper) {
                substepper.stop_adaptation();
              });
            }
            info() {
              return nested_array_apply(
                this.substeppers,
                function (substepper) {
                  return substepper.info();
                },
              );
            }
          };
      exports_2(
        "MultidimComponentMetropolisStepper",
        MultidimComponentMetropolisStepper,
      );
      /**
               * @class
               * @augments {MultidimComponentMetropolisStepper}
               * A "subclass" of MultidimComponentMetropolisStepper making continous Normal proposals.
               */
      MultiRealComponentMetropolisStepper =
          class MultiRealComponentMetropolisStepper
            extends MultidimComponentMetropolisStepper {
            constructor(params, state, log_post, options) {
              super(params, state, log_post, options, RealMetropolisStepper);
            }
          };
      /**
               * @class
               * @augments {MultidimComponentMetropolisStepper}
               * A "subclass" of MultidimComponentMetropolisStepper making discretized Normal proposals.
               */
      MultiIntComponentMetropolisStepper =
          class MultiIntComponentMetropolisStepper
            extends MultidimComponentMetropolisStepper {
            constructor(params, state, log_post, options) {
              super(params, state, log_post, options, IntMetropolisStepper);
            }
          };
      /**
               * @class
               * @implements {Stepper}
               * Constructor for an object that implements a step for a binary parameter.
               * This is done by evaluating the log posterior for both states of the
               * parameter and then selecting a state randomly with probability relative
               * to the posterior of each state.
               * @param params - An object with a single parameter definition.
               * @param state - an object containing the state of all parameters.
               * @param log_post - A function that returns the log density that depends on the state.
               * @param options - an object with options to the stepper.
              */
      BinaryStepper = class BinaryStepper extends Stepper {
        constructor(params, state, log_post, options) {
          super(params, state, log_post);
          var param_names = Object.keys(this.params);
          if (param_names.length == 1) {
            this.param_name = param_names[0];
          } else {
            throw "BinaryStepper can't handle more than one parameter.";
          }
        }
        step() {
          this.state[this.param_name] = 0;
          var zero_log_dens = this.log_post();
          this.state[this.param_name] = 1;
          var one_log_dens = this.log_post();
          var max_log_dens = Math.max(zero_log_dens, one_log_dens);
          zero_log_dens -= max_log_dens;
          one_log_dens -= max_log_dens;
          var zero_prob = Math.exp(
            zero_log_dens -
              Math.log(Math.exp(zero_log_dens) + Math.exp(one_log_dens)),
          );
          if (Math.random() < zero_prob) {
            this.state[this.param_name] = 0;
            return 0;
          } // else keep the param at 1 .
          return 1;
        }
        info() {
          return {};
        }
      };
      exports_2("BinaryStepper", BinaryStepper);
      /**
               * @class
               * @implements {Stepper}
               * Just like MultidimComponentMetropolisStepper this Stepper takes a steps for
               * a multidimensional parameter by updating each component in turn. The difference
               * is that this stepper works on binary parameters.
               * @param params - An object with a single parameter definition for a
               *   multidimensional parameter.
               * @param state - an object containing the state of all parameters.
               * @param log_post - A function that returns the log density that depends on the state.
               * @param options - an object with options to the stepper.
              */
      BinaryComponentStepper = class BinaryComponentStepper extends Stepper {
        constructor(params, state, log_post, options) {
          super(params, state, log_post);
          // Stepper.call(this, );
          var param_names = Object.keys(this.params);
          if (param_names.length == 1) {
            this.param_name = param_names[0];
            var param = this.params[this.param_name];
            this.dim = param.dim;
          } else {
            throw "BinaryComponentStepper can't handle more than one parameter.";
          }
          var create_substeppers = function (dim, substate, log_post) {
            var substeppers = [];
            var i;
            if (dim.length === 1) {
              for (i = 0; i < dim[0]; i++) {
                var subparams = {};
                subparams[i] = param;
                substeppers[i] = new BinaryStepper(
                  subparams,
                  substate,
                  log_post,
                );
              }
            } else {
              for (i = 0; i < dim[0]; i++) {
                substeppers[i] = create_substeppers(
                  dim.slice(1),
                  substate[i],
                  log_post,
                );
              }
            }
            return substeppers;
          };
          this.substeppers = create_substeppers(
            this.dim,
            this.state[this.param_name],
            this.log_post,
          );
        }
        step() {
          // Go through the substeppers in a random order and call step() on them.
          return nested_array_random_apply(
            this.substeppers,
            function (substepper) {
              return substepper.step();
            },
          );
        }
        info() {
          return {};
        }
      }; /**
               * @class
               * @implements {Stepper}
               * This stepper can be responsible for taking a step for one or more parameters.
               * For real and int parameters it takes Metropolis within Gibbs steps, and for
               * binary parameters it does evaluates the posterior for both paramter values and
               * randomly changes to a certain value proportionally to that value's posterior
               * (this is also done for each parameter, so also a * within Gibbs approach).
               * This stepper is also adaptive and can be efficient when the number of parameters
               * are not too high and the correlations between parameters are low.
               * @param params - An object with a one or more parameter definitions
               * @param state - an object containing the state of all parameters.
               * @param log_post - A function that returns the log density that depends on the state.
               * @param options - an object with options to the stepper.
              */

      exports_2("BinaryComponentStepper", BinaryComponentStepper);
      (function (ParameterType) {
        ParameterType[ParameterType["Real"] = 0] = "Real";
        ParameterType[ParameterType["Binary"] = 1] = "Binary";
        ParameterType[ParameterType["Int"] = 2] = "Int";
      })(ParameterType || (ParameterType = {}));
      exports_2("ParameterType", ParameterType);
      AmwgStepper = class AmwgStepper extends Stepper {
        constructor(params, state, log_post, options) {
          super(params, state, log_post);
          this.param_names = Object.keys(this.params);
          this.substeppers = [];
          for (var i = 0; i < this.param_names.length; i++) {
            var param = params[this.param_names[i]];
            var SelectStepper;
            switch (param.type) {
              case ParameterType.Real:
                if (array_equal(param.dim, [1])) {
                  SelectStepper = RealMetropolisStepper;
                } else {
                  SelectStepper = MultiRealComponentMetropolisStepper;
                }
                break;
              case ParameterType.Int:
                if (array_equal(param.dim, [1])) {
                  SelectStepper = IntMetropolisStepper;
                } else {
                  SelectStepper = MultiIntComponentMetropolisStepper;
                }
                break;
              case ParameterType.Binary:
                if (array_equal(param.dim, [1])) {
                  SelectStepper = BinaryStepper;
                } else {
                  SelectStepper = BinaryComponentStepper;
                }
                break;
              default:
                throw "AmwgStepper can't handle parameter " +
                  this.param_names[i] +
                  " with type " + param.type;
            }
            var param_object_wrap = {};
            param_object_wrap[this.param_names[i]] = param;
            options = options || {};
            var param_options =
              options.params && options.params[this.param_names[i]] || {};
            param_options.prop_log_scale = param_options.prop_log_scale ||
              options.prop_log_scale;
            param_options.batch_size = param_options.batch_size ||
              options.batch_size;
            param_options.max_adaptation = param_options.max_adaptation ||
              options.max_adaptation;
            param_options.initial_adaptation =
              param_options.initial_adaptation ||
              options.initial_adaptation;
            param_options.target_accept_rate =
              param_options.target_accept_rate ||
              options.target_accept_rate;
            param_options.is_adapting = param_options.is_adapting ||
              options.is_adapting;
            this.substeppers[i] = new SelectStepper(
              param_object_wrap,
              state,
              log_post,
              param_options,
            );
          }
        }
        step() {
          shuffle_array(this.substeppers);
          for (var i = 0; i < this.substeppers.length; i++) {
            this.substeppers[i].step();
          }
          return this.state;
        }
        start_adaptation() {
          for (var i = 0; i < this.substeppers.length; i++) {
            this.substeppers[i].start_adaptation();
          }
        }
        stop_adaptation() {
          for (var i = 0; i < this.substeppers.length; i++) {
            this.substeppers[i].stop_adaptation();
          }
        }
        info() {
          var info = {};
          for (var i = 0; i < this.substeppers.length; i++) {
            info[this.param_names[i]] = this.substeppers[i].info();
          }
          return info;
        }
      };
      exports_2("AmwgStepper", AmwgStepper);
      /////////// Sampler Functions //////////
      ////////////////////////////////////////
      /**
               * @interface
               * While you could fit a model by pasting together Steppers, a
              // Sampler is here is a convenience class where an instance of Sampler
              // sets up the Steppers, checks the parameter definition,
              // and manages the sampling. This here defines the Sampler "interface".
               * @interface
               * @param params - An object with parameter definitions, for example:
               *   {"mu": {"type": "real"}, "sigma": {"type": "real", "lower" = 0}}
               *   The parameter definitions doesn't have to be "complete" and properties
               *   left out (like lower and upper) will be filled in by defaults.
               * @param log_post - A function with signature function(state, data). Here
               *   state will be an object representing the state with each parameter as a
               *   key and the parameter values as numbers or arrays. For example:
               *   {"mu": 3, "sigma": 1.5}. The data argument will be the same object as
               *   the data argument given below.
               * @param data - an object that will be passed on to the log_post function
               *   when sampling.
               * @param options - an object with options to the sampler.
               */
      Sampler = class Sampler {
        constructor(params, log_post, data, options) {
          this.params = params;
          this.data = data;
          this.param_names = Object.keys(this.params);
          // Setting default options if not passed through the options object
          this.param_init_fun = get_option(
            "param_init_fun",
            options,
            param_init_fixed,
          );
          var thinning_interval = get_option("thin", options, 1);
          var params_to_monitor = get_option("monitor", options, null);
          this.thin(thinning_interval);
          this.monitor(params_to_monitor);
          this.options = options;
          // Completing the params and initializing the state.
          this.params = complete_params(this.params, this.param_init_fun);
          var state = {};
          for (var i = 0; i < this.param_names.length; i++) {
            state[this.param_names[i]] = this.params[this.param_names[i]].init;
          }
          this.log_post = function () {
            return log_post(state, data);
          };
          // Running the log_post function once in case it further modifies the state
          // for example adding derived quantities.
          this.log_post();
          this.state = state;
          this.steppers = this.create_stepper_ensamble(
            this.params,
            this.state,
            this.log_post,
            this.options,
          );
        }
        /** Returns an object with info about the state of the Sampler.
                 */
        info() {
          return {
            state: this.state,
            thin: this.thin,
            monitor: this.monitor,
            steppers: this.steppers,
          };
        }
        /** Takes a step in the parameter space. Returns the new space
                 * but also modifies the state in place.
                 */
        step() {
          shuffle_array(this.steppers);
          for (var i = 0; i < this.steppers.length; i++) {
            this.steppers[i].step();
          }
          if (
            Object.keys(this.state).length > Object.keys(this.params).length
          ) {
            // The state contains devived quantities (not only parameters) and we
            // need to run the log_post once more in order to set the derived quantities
            // for the final parameter state
            this.log_post();
          }
          return this.state;
        }
        /**
                 * Takes n_iterations steps in the parameter space and returns them
                 * as an object of arrays with one array per parameter. For example:
                 * {mu: [1, -1, 2, 3, ...], sigma: [1, 2, 2, 1, ...]}.
                 * If thin is > 1 then n_iterations / thin samples are returned.
                 */
        sample(n_iterations) {
          // Initializing curr_sample where the sample is going to be saved
          // as an object containing one array per parameter to be monitored.
          var i, j, monitored_params;
          if (this.monitored_params === null) {
            monitored_params = Object.keys(this.state);
          } else {
            monitored_params = this.monitored_params;
          }
          var curr_sample = {};
          for (j = 0; j < monitored_params.length; j++) {
            curr_sample[monitored_params[j]] = [];
          }
          for (i = 0; i < n_iterations; i++) {
            if (i % this.thinning_interval === 0) {
              for (j = 0; j < monitored_params.length; j++) {
                var param = monitored_params[j];
                curr_sample[param].push(clone_param_draw(this.state[param]));
              }
            }
            this.step();
          }
          return curr_sample;
        }
        /**
                 * Takes n_iteration steps in parameter space but returns nothing.
                 */
        burn(n_iterations) {
          for (var i = 0; i < n_iterations; i++) {
            this.step();
          }
        }
        /**
                 * Sets what parameters should be monitored and returned when calling
                 * sample.
                 */
        monitor(params_to_monitor) {
          this.monitored_params = params_to_monitor;
        }
        /**
                 * Sets the thinning. For example thin == 10 means that every 10th posterior
                 * draw will be kept.
                 */
        thin(thinning_interval) {
          this.thinning_interval = thinning_interval;
        }
        /**
                 * Sets adaptation on, if applicable, in all steppers.
                 */
        start_adaptation() {
          for (var i = 0; i < this.steppers.length; i++) {
            this.steppers[i].start_adaptation();
          }
        }
        /**
                 * Sets adaptation off, if applicable, in all steppers.
                 */
        stop_adaptation() {
          for (var i = 0; i < this.steppers.length; i++) {
            this.steppers[i].stop_adaptation();
          }
        }
      };
      /**
               * @class
               * @implements {Sampler}
               * This sampler uses the AmwgStepper as the stepper function which implements the
               * Adaptive Metropolis-Within-Gibbs algorithm in "Examples of Adaptive MCMC"
               * by Roberts and Rosenthal (2008). An adition is that it handles int parameters
               * by making discrete Normal proposals and binary parameters by taking on a new
               * value proportional to the posterior of the two possible states of the
               * parameter. This sampler can be efficient when the number of parameters
               * are not too high and the correlations between parameters are low.
               * @param params - An object with a one or more parameter definitions
               * @param state - an object containing the state of all parameters.
               * @param log_post - A function that returns the log density that depends on the state.
               * @param options - an object with options to the stepper.
              */
      AmwgSampler = class AmwgSampler extends Sampler {
        constructor(params, log_post, data, options) {
          super(params, log_post, data, options);
        }
        create_stepper_ensamble(params, state, log_post, options) {
          return [new AmwgStepper(params, state, log_post, options)];
        }
      };
      exports_2("AmwgSampler", AmwgSampler);
    },
  };
});
System.register(
  "test_bayes",
  ["bayesjs/distributions", "bayesjs/mcmc"],
  function (exports_3, context_3) {
    "use strict";
    var ld, mcmc, data, params, sampler, samples;
    var __moduleName = context_3 && context_3.id;
    function log_post(state, data) {
      var log_post = 0;
      // Priors
      log_post += ld.norm(state.mu, 0, 100);
      log_post += ld.unif(state.sigma, 0, 100);
      // Likelihood
      for (var i = 0; i < data.length; i++) {
        log_post += ld.norm(data[i], state.mu, state.sigma);
      }
      return log_post;
    }
    return {
      setters: [
        function (ld_1) {
          ld = ld_1;
        },
        function (mcmc_1) {
          mcmc = mcmc_1;
        },
      ],
      execute: function () {
        data = [183, 192, 182, 183, 177, 185, 188, 188, 182, 185];
        params = {
          mu: { type: mcmc.ParameterType.Real },
          sigma: { type: mcmc.ParameterType.Real, lower: 0 },
        };// Initializing the sampler

        sampler = new mcmc.AmwgSampler(params, log_post, data);
        // Burning some samples to the MCMC gods and sampling 5000 draws.
        sampler.burn(1000);
        samples = sampler.sample(5000);
        window.samples = samples;
      },
    };
  },
);

__instantiate("test_bayes");
