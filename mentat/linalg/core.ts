import * as utils from "../utils.ts";
/*
Copyright (c) 2016 Chi Feng

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

/**
 * INFO: port of the _Bayes for physicists_ linear algebra library to Deno
 */
export let precision = 1e-6;


export interface LUResult {
  L: Matrix;
  U: Matrix;
  P: Matrix;
}

export interface SVDResult {
  U: Matrix;
  S: Vector;
  V: Matrix;
}

export class Vector {
  dim: number;
  data: Float64Array;
  constructor(array: Array<number> | Float64Array) {
    this.dim = array.length;
    if (array instanceof Array) {
      this.data = new Float64Array(this.dim);
      for (let i = 0; i < this.dim; i++) {
        this.data[i] = array[i];
      }
    } else {
      this.data = array;
    }
  }
  map(f: Function): Vector {
    this.data = this.data.map((x) => f.apply(x));
    return this;
  }
  /**
   * Create diagonal matrix from a vector
   * @return {Float64Array} a diagonal matrix
   */

  asDiagonal(): Matrix {
    var D = Zeros(this.data.length, this.data.length);
    for (var i = 0; i < this.data.length; ++i) {
      D.data[i * this.data.length + i] = this.data[i];
    }
    return D;
  }
  sum(): number {
    var sum = 0.0;
    for (let i = 0; i < this.dim; i++) {
      sum += this.data[i];
    }
    return sum;
  }
  static zeros(n: number): Vector {
    let matrix = new Float64Array(n);
    return new Vector(matrix);
  }
  add(other: Vector | number): Vector {
    if (other instanceof Vector) {
      for (let i = 0; i < this.dim; i++) {
        this.data[i] += other.data[i];
      }
    } else {
      for (let i = 0; i < this.dim; i++) {
        this.data[i] += other;
      }
    }
    return this;
  }
  copy(): Vector {
    return new Vector(this.data);
  }
}

/**
 * Creates a "matrix" from an existing array-like object with optional dimensions
 * @param  {ArrayLike} array existing array, can be nested or flat (row-major)
 * @param  {int}       rows  number of rows
 * @param  {int}       cols  number of columns
 * @return {Float64Array}
 */

export class Matrix {
  data: Float64Array;
  rows: number;
  cols: number;
  dim: number;

  constructor(
    array: Array<any> | Float64Array,
    rows: number,
    cols: number,
  ) {
    if (array instanceof Array) {
      if (Array.isArray(array[0])) { // flatten nested arrays
        rows = array.length;
        cols = array[0].length;
        this.data = new Float64Array(rows * cols);
        this.rows = rows;
        this.cols = cols;
        for (var i = 0; i < rows; ++i) {
          for (var j = 0; j < cols; ++j) {
            this.data[i * cols + j] = array[i][j];
          }
        }
      } else {
        this.data = new Float64Array(array);
        this.rows = rows || array.length;
        this.cols = cols || 1;
      }
    } else {
      this.data = array;
      this.rows = rows || array.length;
      this.cols = cols || 1;
    }
    this.dim = this.data.length;
  }
  /**
 * String representation
 * @param  {int} precision (optional)
 * @return {string}
 */
  toString(precision: number): string {
    precision = precision || 4;
    var str = "";
    for (let i = 0; i < this.rows; ++i) {
      str += (i == 0) ? "[[ " : " [ ";
      str += this.data[i * this.cols + 0].toPrecision(precision);
      for (var j = 1; j < this.cols; ++j) {
        str += ", " + this.data[i * this.cols + j].toPrecision(precision);
      }
      str += (i == this.rows - 1) ? " ]]" : " ],\n";
    }
    return str;
  }

  asNestedArray(): Array<Array<number>> {
    let result: Array<Array<number>> = [];
    for (let i = 0; i < this.rows; i++) {
      result.push(Array.from(this.row(i).data));
    }
    return result;
  }

  addColumn(col: Vector | Array<number> | Float64Array) {
    if (col instanceof Vector) {
      col = col.data;
    }
    const new_data = new Float64Array(this.rows * this.cols + this.rows)
    let shift = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0 ; j < this.cols ; j++) {
        new_data[i * this.rows + j + shift] = this.data[i * this.rows + j];
      }
      shift += 1;
    }
    for (let i = 0; i < this.rows; i++) {
        new_data[i * this.rows + this.cols + i] = col[i]
    }

    this.data = new_data
    this.cols += 1
    this.dim = new_data.length
  }

  // setCol(j: number, col: Vector | Array<number> | Float64Array): Matrix {
  //   if (col instanceof Vector) {
  //     col = col.data;
  //   }
  //   for (var i = 0; i < this.rows; ++i) {
  //     this.data[i * this.cols + j] = col[i];
  //   }
  //   return this;
  // }

  /**
 * Returns a copy of a "matrix"
 * @return {Float64Array}
 */
  copy(): Matrix {
    var copy = new Float64Array(this.data);

    let rows = this.rows || this.data.length;
    let cols = this.cols || 1;
    return new Matrix(copy, rows, cols);
  }

  /**
 * (in place) Each element is replaced by a function applied to the element index
 * @param  {function} f takes ([i, [j]]) as arguments
 * @return {Float64Array}
 */
  rebuild(f: Function): Matrix {
    if (this.cols == 1) {
      for (var i = 0; i < this.rows; ++i) {
        this.data[i] = f(i, i);
      }
    } else {
      for (var i = 0; i < this.rows; ++i) {
        for (var j = 0; j < this.cols; ++j) {
          this.data[i * this.cols + j] = f(i, j);
        }
      }
    }
    return this;
  }

  /**
 * Matrix transpose (copy)
 * @return {Float64Array}
 */
  transpose(): Matrix {
    var m = this.rows, n = this.cols;
    var transposed = Zeros(n, m);
    for (var i = 0; i < m; ++i) {
      for (var j = 0; j < n; ++j) {
        transposed.data[j * m + i] = this.data[i * n + j];
      }
    }
    return transposed;
  }
  /**
 * cwise map function onto matrix copy
 * @param  {function} f arguments (A[i], i)
 * @return {Float64Array}
 */
  map(f: Function): Matrix {
    var A = Zeros(this.rows, this.cols);
    for (var i = 0; i < this.data.length; ++i) {
      A.data[i] = f(this.data[i], i);
    }
    return A;
  }

  /**
 * Add two matrices and return sum
 * @param  {Float64Array} other
 * @return {Float64Array}
 */
  add(other: Matrix): Matrix {
    if (
      this.cols != other.cols || this.rows != other.rows
    ) {
      throw "matrix dimension mismatch";
    }
    var sum = Zeros(this.rows, this.cols);
    for (var i = 0; i < this.rows; ++i) {
      for (var j = 0; j < this.cols; ++j) {
        sum.data[i * this.cols + j] = this.data[i * this.cols + j] +
          other.data[i * this.cols + j];
      }
    }
    return sum;
  }
  /**
   * Negates the matrix. All elements will be multiplied by `-1`.
   */
  neg(): Matrix {
    return new Matrix(this.data.map(x => -x), this.rows, this.cols);
  }
  /**
 * Increment matrix (in place)
 * @param  {Float64Array} other
 * @return {Float64Array}
 */
  increment(other: Matrix): Matrix {
    if (
      this.cols != other.cols || this.rows != other.rows
    ) {
      throw "matrix dimension mismatch";
    }
    for (var i = 0; i < this.rows; ++i) {
      for (var j = 0; j < this.cols; ++j) {
        this.data[i * this.cols + j] += other.data[i * this.cols + j];
      }
    }
    return this;
  }

  /**
 * Decrement matrix (in place)
 * @param  {Float64Array} other
 * @return {Float64Array}
 */
  decrement(other: Matrix): Matrix {
    if (
      this.cols != other.cols || this.rows != other.rows
    ) {
      throw "matrix dimension mismatch";
    }
    for (var i = 0; i < this.rows; ++i) {
      for (var j = 0; j < this.cols; ++j) {
        this.data[i * this.cols + j] -= other.data[i * this.cols + j];
      }
    }
    return this;
  }

  /**
   * Subtract two matrices and return difference
   * @param  {Float64Array} other
   * @return {Float64Array}
   */
  subtract(other: Matrix): Matrix {
    if (
      this.cols != other.cols || this.rows != other.rows
    ) {
      throw "matrix dimension mismatch";
    }
    var difference = Zeros(this.rows, this.cols);
    for (var i = 0; i < this.rows; ++i) {
      for (var j = 0; j < this.cols; ++j) {
        difference.data[i * this.cols + j] = this.data[i * this.cols + j] -
          other.data[i * this.cols + j];
      }
    }
    return difference;
  }

  /**
   * Compute squared euclidian distance
   * @param  {Float64Array} other
   * @return {float}       square euclidian distance
   */
  dist2(other: Matrix): number {
    var d2 = 0;
    for (var i = 0; i < this.data.length; ++i) {
      d2 += Math.pow(this.data[i] - other.data[i], 2);
    }
    return d2;
  }

  /**
   * Compute euclidian distance
   * @param  {Float64Array} other
   * @return {float}       euclidian distance
   */
  dist(other: Matrix): number {
    return Math.sqrt(this.dist2(other));
  }

  /**
   * Multiply by scalar and return copy
   * @param  {Float64Array} scalar
   * @return {Float64Array}
   */
  scale(scalar: number): Matrix {
    var scaled = Zeros(this.rows, this.cols);
    for (var i = 0; i < this.rows; ++i) {
      for (var j = 0; j < this.cols; ++j) {
        scaled.data[i * this.cols + j] = scalar *
          this.data[i * this.cols + j];
      }
    }
    return scaled;
  }
  /**
 * cwise negate matrix copy
 * @return {Float64Array}
 */
  negate(): Matrix {
    var A = Zeros(this.rows, this.cols);
    for (var i = 0; i < this.data.length; ++i) {
      A.data[i] = -this.data[i];
    }
    return A;
  }

  /**
   * Trace of a "matrix," i.e. sum along diagonal
   * @return {float}
   */
  trace(): number {
    let diagonal = this.diagonal();
    var trace = 0;
    for (let i = 0; i < diagonal.dim; ++i) {
      trace += diagonal.data[i];
    }
    return trace;
  }

  /**
   * Element-wise 2-norm (Frobenius-norm for matrices)
   * @return {float}
   */
  norm(): number {
    var norm = 0;
    for (var i = 0; i < this.data.length; ++i) {
      norm += this.data[i] * this.data[i];
    }
    return Math.sqrt(norm);
  }

  /**
   * Element-wise squared norm
   * @return {float}
   */
  norm2(): number {
    var norm = 0;
    for (var i = 0; i < this.data.length; ++i) {
      norm += this.data[i] * this.data[i];
    }
    return norm;
  }

  /**
   * Sum of all elements
   * @return {float}
   */
  sum(): number {
    var sum = 0;
    for (var i = 0; i < this.data.length; ++i) {
      sum += this.data[i];
    }
    return sum;
  }

  /**
   * Get diagonal as a column vector
   * @return {Float64Array}
   */
  diagonal(): Vector {
    var diagonal = Vector.zeros(Math.min(this.rows, this.cols));
    for (var i = 0; i < diagonal.dim; ++i) {
      diagonal.data[i] = this.data[i * this.cols + i];
    }
    return diagonal;
  }

  /**
   * Get row i as a row vector
   * @param  {int} i row index
   * @return {Float64Array}
   */
  row(i: number): Vector {
    var row = Vector.zeros(this.cols);
    for (var j = 0; j < this.cols; ++j) {
      row.data[j] = this.data[i * this.cols + j];
    }
    return row;
  }

  /**
   * Get column j as as column vector
   * @param  {int} j column index
   * @return {Float64Array}
   */
  col(j: number): Vector {
    var col = Vector.zeros(this.cols);
    for (var i = 0; i < this.rows; ++i) {
      col.data[i] = this.data[i * this.cols + j];
    }
    return col;
  }

  setRow(i: number, row: Vector | Array<number> | Float64Array): Matrix {
    if (row instanceof Vector) {
      row = row.data;
    }
    for (var j = 0; j < this.cols; ++i) {
      this.data[i * this.cols + j] = row[i];
    }
    return this;
  }

  setCol(j: number, col: Vector | Array<number> | Float64Array): Matrix {
    if (col instanceof Vector) {
      col = col.data;
    }
    for (var i = 0; i < this.rows; ++i) {
      this.data[i * this.cols + j] = col[i];
    }
    return this;
  }

  /**
   * Swap rows i and k
   * @param  {int} i row index
   * @param  {int} k row index
   * @return {Float64Array} (for chaining)
   */
  swap_rows(i: number, k: number): Matrix {
    for (var j = 0; j < this.cols; ++j) {
      var tmp = this.data[i * this.cols + j];
      this.data[i * this.cols + j] = this.data[k * this.cols + j];
      this.data[k * this.cols + j] = tmp;
    }
    return this;
  }

  /**
   * Computes determinant using upper triangulation
   * @return {float} NaN if uninvertible
   */
  det(): number {
    if (this.rows != this.cols) throw "det() requires square matrix";
    if (this.rows == 2 && this.cols == 2) {
      return this.data[0] * this.data[3] - this.data[1] * this.data[2];
    }
    // upper triangularize, then return product of diagonal
    var U = this.copy();
    // TODO: sure about this n?
    let n = this.rows;
    for (var i = 0; i < n; ++i) {
      var max = 0;
      for (var row = i; row < n; ++row) {
        if (Math.abs(U.data[row * n + i]) > Math.abs(U.data[max * n + i])) {
          max = row;
        }
      }
      if (max > 0) {
        U.swap_rows(i, max);
      }
      if (U.data[i * n + i] == 0) return NaN;
      for (var row = i + 1; row < n; ++row) {
        var r = U.data[row * n + i] / U.data[i * n + i];
        if (r == 0) continue;
        for (var col = i; col < n; ++col);
        U.data[row * n + col] -= U.data[i * n + col] * r;
      }
    }
    var det = 1;
    for (var i = 0; i < n; ++i) {
      det *= U.data[i * n + i];
    }
    return det;
  }

  /**
   * Generalized dot product (sum of element-wise multiplication)
   * @param  {Float64Array} other another "matrix" of same size
   * @return {float}
   */
  dot(other: Matrix | Vector): number {
    var prod = 0;
    for (var i = 0; i < this.data.length; ++i) {
      prod += this.data[i] * other.data[i];
    }
    return prod;
  }

  /**
   * Matrix multiplication (naive implementation)
   * @param  {Float64Array} other
   * @return {Float64Array}
   */
  multiply(other: Matrix | Vector): Matrix | Vector {
    let A = this;
    let B = other;
    var n = A.rows;
    var l = A.cols;
    if (B instanceof Matrix) {
      if (A.cols != B.rows) throw "multiply() dimension mismatch";
      let m = B.cols;
      var C = Zeros(n, m);
      for (var i = 0; i < n; ++i) {
        for (var j = 0; j < m; ++j) {
          var cij = 0;
          for (var k = 0; k < l; ++k) {
            cij += A.data[i * l + k] * B.data[k * m + j];
          }
          C.data[i * m + j] = cij;
        }
      }
      return C;
    } else {
      // matrix-vector product
      let V = Vector.zeros(n);
      for (var i = 0; i < n; ++i) {
        for (var j = 0; j < l; ++j) {
          V.data[i] += A.data[i * l + j] * B.data[j];
        }
      }
      return V;
    }

    // TODO: Add to Vector
    // // vector-matrix product
    // if (n == 1) {
    //   for (var j = 0; j < m; ++j) {
    //     for (var k = 0; k < l; ++k) {
    //       C.matrix[j] += A.matrix[k] * B.matrix[k * m + j];
    //     }
    //   }
    //   return C;
    // }
  }

  /**
   * Computes PA = LU decomposition
   * @return {LUResult} {L, U, P}
   */
  lu(): LUResult {
    if (this.rows != this.cols) throw "lu() requires square matrix";
    var n = this.rows;
    var L = Zeros(n, n);
    var U = Zeros(n, n);
    var P = Eye(n);
    for (var j = 0; j < n; ++j) {
      var max = j;
      for (var i = j; i < n; ++i) {
        if (
          Math.abs(this.data[i * n + j]) > Math.abs(this.data[max * n + j])
        ) {
          max = i;
        }
      }
      if (j != max) {
        P.swap_rows(j, max);
      }
    }
    var PA = P.multiply(this);
    for (var j = 0; j < n; ++j) {
      L.data[j * n + j] = 1;
      for (var i = 0; i < j + 1; ++i) {
        var s = 0;
        for (var k = 0; k < i; ++k) {
          s += U.data[k * n + j] * L.data[i * n + k];
        }
        U.data[i * n + j] = PA.data[i * n + j] - s;
      }
      for (var i = j; i < n; ++i) {
        var s = 0;
        for (var k = 0; k < i; ++k) {
          s += U.data[k * n + j] * L.data[i * n + k];
        }
        L.data[i * n + j] = (PA.data[i * n + j] - s) / U.data[j * n + j];
      }
    }
    return { L: L, U: U, P: P };
  }

  /**
   * Cholesky A = LL^T decomposition (in-place)
   * @return {[type]} [description]
   */
  chol_inplace(): Matrix {
    if (this.rows != this.cols) throw "chol_inplace() requires square matrix";
    let m = this.rows;
    let n = this.cols;
    var s = 0.0;
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < (i + 1); ++j) {
        s = 0.0;
        for (let k = 0; k < j; ++k) {
          s += this.data[i * n + k] * this.data[j * n + k];
        }
        if (i != j) this.data[j * n + i] = 0;
        if (
          i == j && this.data[i * n + i] - s < 0
        ) {
          throw "chol_inplace() matrix not positive definite";
        }
        this.data[i * n + j] = (i == j)
          ? Math.sqrt(this.data[i * n + i] - s)
          : ((this.data[i * n + j] - s) / this.data[j * n + j]);
      }
    }
    return this;
  }

  /**
   * Cholesky A = LL^T decomposition (returns copy)
   * @return {Float64Array}
   */
  chol(): Matrix {
    return this.copy().chol_inplace();
  }

  /**
     * Solves Lx = b using foward substitution, updates b
     * @param  {Float64Array} b rhs
     * @return {Float64Array}
     */
  fsolve_inplace(b: Vector): Vector {
    var L = this;
    var m = L.rows, n = L.cols;
    for (var i = 0; i < n; ++i) {
      var s = 0.0;
      for (var j = 0; j < i; ++j) {
        s += L.data[i * n + j] * b.data[j];
      }
      b.data[i] = (b.data[i] - s) / L.data[i * n + i];
    }
    return b;
  }

  /**
     * Solves Lx = b using foward substitution
     * @param  {Float64Array} b rhs
     * @return {Float64Array}
     */
  fsolve(b: Vector): Vector {
    return this.fsolve_inplace(b.copy());
  }

  //   /**
  //    * Solves Ux = b using backward substitution, updates b
  //    * @param  {Float64Array} b rhs
  //    * @param  {object} options {transpose: false}
  //    * @return {Float64Array}
  //    */
  //   Float64Array.prototype.bsolve_inplace = function(b, options) {
  //     var U = this;
  //     var m = U.rows, n = U.cols;
  //     options = options || {};
  //     var transpose = options.hasOwnProperty('transpose') ? options.transpose : false;
  //     for (var i = n - 1; i >= 0; --i) {
  //       var s = 0.0;
  //       for (var j = i + 1; j < n; ++j)
  //         s += (transpose ? U[j * n + i] : U[i * n + j]) * b[j];
  //       b[i] = (b[i] - s) / U[i * n + i];
  //     }
  //     return b;
  //   };

  //   /**
  //    * Solves Ux = b using backward substitution
  //    * @param  {Float64Array} b rhs
  //    * @param  {object} options {transpose: false}
  //    * @return {Float64Array}
  //    */
  //   Float64Array.prototype.bsolve = function(b, options) {
  //     return this.bsolve_inplace(b.copy(), options);
  //   };

  //   /**
  //    * Solve Ax = b using PA = LU decomposition
  //    * @param  {Float64Array} b rhs
  //    * @return {Float64Array} x
  //    */
  //   Float64Array.prototype.lu_solve = function(b) {
  //     var res = this.lu(), P = res.P, L = res.L, U = res.U;
  //     return U.bsolve(L.fsolve(P.multiply(b)));
  //   };

  /**
     * Computes the matrix inverse using PA = LU decomposition
     * @return {Float64Array} A^-1
     */
  lu_inverse(): Matrix {
    let res = this.lu();
    let P = res.P;
    let L = res.L;
    let U = res.U;
    var inverse = Zeros(this.rows, this.cols);
    var eye = Eye(this.rows);
    for (var j = 0; j < this.cols; ++j) {
      let mult = P.multiply(eye.col(j)) as Vector;
      inverse.setCol(j, U.bsolve(L.fsolve(mult)));
    }
    return inverse;
  }

  /**
 * Solves Ux = b using backward substitution, updates b
 * @param  {Float64Array} b rhs
 * @param  {object} options {transpose: false}
 * @return {Float64Array}
 */
  bsolve_inplace(b: Vector, options?: any): Vector {
    var U = this;
    var m = U.rows, n = U.cols;
    options = options || {};
    var transpose = options.hasOwnProperty("transpose")
      ? options.transpose
      : false;
    for (var i = n - 1; i >= 0; --i) {
      var s = 0.0;
      for (var j = i + 1; j < n; ++j) {
        s += (transpose ? U.data[j * n + i] : U.data[i * n + j]) * b.data[j];
      }
      b.data[i] = (b.data[i] - s) / U.data[i * n + i];
    }
    return b;
  }

  /**
   * Solves Ux = b using backward substitution
   * @param  {Float64Array} b rhs
   * @param  {object} options {transpose: false}
   * @return {Float64Array}
   */
  bsolve(b: Vector, options?: any): Vector {
    return this.bsolve_inplace(b.copy(), options);
  }

  //   /**
  //    * Solve Ax = b using A = LL^T decomposition
  //    * @param  {Float64Array} b rhs
  //    * @return {Float64Array} x
  //    */
  //   Float64Array.prototype.llt_solve = function(b) {
  //     var L = this.chol();
  //     return L.bsolve(L.fsolve(b), {transpose: true});
  //   };

  /**
     * Computes the matrix inverse using LL^T decomposition
     * @return {Float64Array} A^-1
     */
  llt_inverse(): Matrix {
    var L = this.chol();
    var inverse = Zeros(this.rows, this.cols);
    var eye = Eye(this.rows);
    for (var j = 0; j < this.cols; ++j) {
      inverse.setCol(j, L.bsolve(L.fsolve(eye.col(j)), { transpose: true }));
    }
    return inverse;
  }

  //   /**
  //    * Solve Ax = b using A = LL^T decomposition (in-place)
  //    * @param  {Float64Array} b rhs
  //    * @return {Float64Array} x
  //    */
  //   Float64Array.prototype.llt_solve_inplace = function(b) {
  //     var L = this.chol_inplace();
  //     return L.bsolve_inplace(L.fsolve_inplace(b), {transpose: true});
  //   };

  //   /**
  //    * Computes diagonal matrix D of eigenvalues and matrix V whose columns are the corresponding
  //    * right eigenvectors so that AV = VD
  //    * @param  {object} options tolerance and maxIter
  //    * @return {object}         V:V D:D
  //    */
  //   Float64Array.prototype.jacobiRotation = function(options) {

  //     if (this.cols != this.rows) throw 'matrix must be square';

  //     if (arguments.length < 1)
  //       options = {};

  //     var maxIter = options.maxIter || 100;
  //     var tolerance = options.tolerance || 1e-5;

  //     var n = this.rows;
  //     var D = this.copy();
  //     var V = Float64Array.eye(n, n);

  //     var iter, maxOffDiag, p, q;
  //     for (iter = 0; iter < maxIter; ++iter) {

  //       // find max off diagonal term at (p, q)
  //       maxOffDiag = 0;
  //       for (var i = 0; i < n - 1; ++i) {
  //         for (var j = i + 1; j < n; ++j) {
  //           if (Math.abs(D[i * n + j]) > maxOffDiag) {
  //             maxOffDiag = Math.abs(D[i * n + j]);
  //             p = i; q = j;
  //           }
  //         }
  //       }

  //       if (maxOffDiag < tolerance)
  //         break;

  //       // Rotates matrix D through theta in pq-plane to set D[p][q] = 0
  //       // Rotation stored in matrix V whose columns are eigenvectors of D
  //       // d = cot 2 * theta, t = tan theta, c = cos theta, s = sin theta
  //       var d = (D[p * n + p] - D[q * n + q]) / (2.0 * D[p * n + q]);
  //       var t = Math.sign(d) / (Math.abs(d) + Math.sqrt(d * d + 1));
  //       var c = 1.0 / Math.sqrt(t * t + 1);
  //       var s = t * c;
  //       D[p * n + p] += t * D[p * n + q];
  //       D[q * n + q] -= t * D[p * n + q];
  //       D[p * n + q] =      D[q * n + p] = 0.0;
  //       for (var k = 0; k < n; k++) {  // Transform D
  //         if (k != p && k != q) {
  //           var akp =  c * D[k * n + p] + s * D[k * n + q];
  //           var akq = -s * D[k * n + p] + c * D[k * n + q];
  //           D[k * n + p] = akp;
  //           D[p * n + k] = akp;
  //           D[k * n + q] = akq;
  //           D[q * n + k] = akq;
  //         }
  //       }
  //       for (var k = 0; k < n; k++) {  // Store V
  //         var rkp =  c * V[k * n + p] + s * V[k * n + q];
  //         var rkq = -s * V[k * n + p] + c * V[k * n + q];
  //         V[k * n + p] = rkp;
  //         V[k * n + q] = rkq;
  //       }
  //     }

  //     if (iter == maxIter) {
  //       console.log('Hit maxIter: ', maxOffDiag, ' > ', tolerance);
  //     }

  //     return {V:V, D:D, eigenvalues: D.diagonal(), eigenvectors: V};

  //   };

  //   Float64Array.prototype.maxCoeff = function() {
  //     var max = this[0];
  //     for (var i = 0; i < this.length; ++i) {
  //       if (this[i] > max)
  //         max = this[i];
  //     }
  //     return max;
  //   };

  //   Float64Array.prototype.cwiseProduct = function(other) {
  //     var A = this.copy();
  //     for (var i = 0; i < this.length; ++i) {
  //       A[i] = this[i] * other[i];
  //     }
  //     return A;
  //   };

  //   Float64Array.prototype.cwiseQuotient = function(other) {
  //     var A = this.copy();
  //     for (var i = 0; i < this.length; ++i) {
  //       A[i] = this[i] / other[i];
  //     }
  //     return A;
  //   };

  //   Float64Array.prototype.cwiseInverse = function() {
  //     var A = this.copy();
  //     for (var i = 0; i < this.length; ++i) {
  //       A[i] = 1.0 / this[i];
  //     }
  //     return A;
  //   };

  //   Float64Array.prototype.cwiseSqrt = function() {
  //     var A = this.copy();
  //     for (var i = 0; i < this.length; ++i) {
  //       A[i] = Math.sqrt(this[i]);
  //     }
  //     return A;
  //   };

  /*
Shanti Rao sent me this routine by private email. I had to modify it
slightly to work on Arrays instead of using a Matrix object.
It is apparently translated from http://stitchpanorama.sourceforge.net/Python/svd.py
  */

  svd(): SVDResult {
    let A = this;
    var temp;
    //Compute the thin SVD from G. H. Golub and C. Reinsch, Numer. Math. 14, 403-420 (1970)
    var prec = Math.pow(2, -52); // assumes double prec
    var tolerance = 1.e-64 / prec;
    var itmax = 50;
    var c = 0;
    var i = 0;
    var j = 0;
    var k = 0;
    var l = 0;

    var u = A.copy().asNestedArray();
    var m = u.length;

    var n = u[0].length;

    if (m < n) throw "Need more rows than columns";

    var e = new Array(n);
    var q: Array<number> = new Array(n);
    for (i = 0; i < n; i++) e[i] = q[i] = 0.0;
    var v: Array<Array<number>> = utils.rep([n, n], 0);
    //	v.zero();

    let pythag = (a: number, b: number) => {
      a = Math.abs(a);
      b = Math.abs(b);
      if (a > b) {
        return a * Math.sqrt(1.0 + (b * b / a / a));
      } else if (b == 0.0) {
        return a;
      }
      return b * Math.sqrt(1.0 + (a * a / b / b));
    };

    //Householder's reduction to bidiagonal form

    var f = 0.0;
    var g = 0.0;
    var h = 0.0;
    var x = 0.0;
    var y = 0.0;
    var z = 0.0;
    var s = 0.0;

    for (i = 0; i < n; i++) {
      e[i] = g;
      s = 0.0;
      l = i + 1;
      for (j = i; j < m; j++) {
        s += (u[j][i] * u[j][i]);
      }
      if (s <= tolerance) {
        g = 0.0;
      } else {
        f = u[i][i];
        g = Math.sqrt(s);
        if (f >= 0.0) g = -g;
        h = f * g - s;
        u[i][i] = f - g;
        for (j = l; j < n; j++) {
          s = 0.0;
          for (k = i; k < m; k++) {
            s += u[k][i] * u[k][j];
          }
          f = s / h;
          for (k = i; k < m; k++) {
            u[k][j] += f * u[k][i];
          }
        }
      }
      q[i] = g;
      s = 0.0;
      for (j = l; j < n; j++) {
        s = s + u[i][j] * u[i][j];
      }
      if (s <= tolerance) {
        g = 0.0;
      } else {
        f = u[i][i + 1];
        g = Math.sqrt(s);
        if (f >= 0.0) g = -g;
        h = f * g - s;
        u[i][i + 1] = f - g;
        for (j = l; j < n; j++) e[j] = u[i][j] / h;
        for (j = l; j < m; j++) {
          s = 0.0;
          for (k = l; k < n; k++) {
            s += (u[j][k] * u[i][k]);
          }
          for (k = l; k < n; k++) {
            u[j][k] += s * e[k];
          }
        }
      }
      y = Math.abs(q[i]) + Math.abs(e[i]);
      if (y > x) {
        x = y;
      }
    }

    // accumulation of right hand gtransformations
    for (i = n - 1; i != -1; i += -1) {
      if (g != 0.0) {
        h = g * u[i][i + 1];
        for (j = l; j < n; j++) {
          v[j][i] = u[i][j] / h;
        }
        for (j = l; j < n; j++) {
          s = 0.0;
          for (k = l; k < n; k++) {
            s += u[i][k] * v[k][j];
          }
          for (k = l; k < n; k++) {
            v[k][j] += (s * v[k][i]);
          }
        }
      }
      for (j = l; j < n; j++) {
        v[i][j] = 0;
        v[j][i] = 0;
      }
      v[i][i] = 1;
      g = e[i];
      l = i;
    }

    // accumulation of left hand transformations
    for (i = n - 1; i != -1; i += -1) {
      l = i + 1;
      g = q[i];
      for (j = l; j < n; j++) {
        u[i][j] = 0;
      }
      if (g != 0.0) {
        h = u[i][i] * g;
        for (j = l; j < n; j++) {
          s = 0.0;
          for (k = l; k < m; k++) s += u[k][i] * u[k][j];
          f = s / h;
          for (k = i; k < m; k++) u[k][j] += f * u[k][i];
        }
        for (j = i; j < m; j++) u[j][i] = u[j][i] / g;
      } else {
        for (j = i; j < m; j++) u[j][i] = 0;
      }
      u[i][i] += 1;
    }

    // diagonalization of the bidiagonal form
    prec = prec * x;
    for (k = n - 1; k != -1; k += -1) {
      for (var iteration = 0; iteration < itmax; iteration++) { // test f splitting
        var test_convergence = false;
        for (l = k; l != -1; l += -1) {
          if (Math.abs(e[l]) <= prec) {
            test_convergence = true;
            break;
          }
          if (Math.abs(q[l - 1]) <= prec) {
            break;
          }
        }
        if (!test_convergence) { // cancellation of e[l] if l>0
          c = 0.0;
          s = 1.0;
          var l1 = l - 1;
          for (i = l; i < k + 1; i++) {
            f = s * e[i];
            e[i] = c * e[i];
            if (Math.abs(f) <= prec) {
              break;
            }
            g = q[i];
            h = pythag(f, g);
            q[i] = h;
            c = g / h;
            s = -f / h;
            for (j = 0; j < m; j++) {
              y = u[j][l1];
              z = u[j][i];
              u[j][l1] = y * c + (z * s);
              u[j][i] = -y * s + (z * c);
            }
          }
        }
        // test f convergence
        z = q[k];
        if (l == k) { //convergence
          if (z < 0.0) { //q[k] is made non-negative
            q[k] = -z;
            for (j = 0; j < n; j++) {
              v[j][k] = -v[j][k];
            }
          }
          break; //break out of iteration loop and move on to next k value
        }
        if (iteration >= itmax - 1) {
          throw "Error: no convergence.";
        }
        // shift from bottom 2x2 minor
        x = q[l];
        y = q[k - 1];
        g = e[k - 1];
        h = e[k];
        f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2.0 * h * y);
        g = pythag(f, 1.0);
        if (f < 0.0) {
          f = ((x - z) * (x + z) + h * (y / (f - g) - h)) / x;
        } else {
          f = ((x - z) * (x + z) + h * (y / (f + g) - h)) / x;
        }
        // next QR transformation
        c = 1.0;
        s = 1.0;
        for (i = l + 1; i < k + 1; i++) {
          g = e[i];
          y = q[i];
          h = s * g;
          g = c * g;
          z = pythag(f, h);
          e[i - 1] = z;
          c = f / z;
          s = h / z;
          f = x * c + g * s;
          g = -x * s + g * c;
          h = y * s;
          y = y * c;
          for (j = 0; j < n; j++) {
            x = v[j][i - 1];
            z = v[j][i];
            v[j][i - 1] = x * c + z * s;
            v[j][i] = -x * s + z * c;
          }
          z = pythag(f, h);
          q[i - 1] = z;
          c = f / z;
          s = h / z;
          f = c * g + s * y;
          x = -s * g + c * y;
          for (j = 0; j < m; j++) {
            y = u[j][i - 1];
            z = u[j][i];
            u[j][i - 1] = y * c + z * s;
            u[j][i] = -y * s + z * c;
          }
        }
        e[l] = 0.0;
        e[k] = f;
        q[k] = x;
      }
    }

    //vt= transpose(v)
    //return (u,q,vt)
    for (i = 0; i < q.length; i++) {
      if (q[i] < prec) q[i] = 0;
    }

    //sort eigenvalues
    for (i = 0; i < n; i++) {
      //writeln(q)
      for (j = i - 1; j >= 0; j--) {
        if (q[j] < q[i]) {
          //  writeln(i,'-',j)
          c = q[j];
          q[j] = q[i];
          q[i] = c;
          for (k = 0; k < u.length; k++) {
            temp = u[k][i];
            u[k][i] = u[k][j];
            u[k][j] = temp;
          }
          for (k = 0; k < v.length; k++) {
            temp = v[k][i];
            v[k][i] = v[k][j];
            v[k][j] = temp;
          }
          //	   u.swapCols(i,j)
          //	   v.swapCols(i,j)
          i = j;
        }
      }
    }

    let U = new Matrix(u, this.rows, this.cols);
    console.log(`u: ${u}`);
    console.log(`q: ${q}`);
    console.log(`v: ${v}`);
    let S = new Vector(q);
    let V = new Matrix(v, this.rows, this.cols);

    return { U: U, S: S, V: V };
  }
}

/**
 * Creates a "matrix" with all entries set to zero
 * @param  {int} rows number of rows
 * @param  {int} cols number of columns
 * @return {Float64Array}
 */
export function Zeros(rows: number, cols: number): Matrix {
  cols = cols || 1;
  var matrix = new Float64Array(rows * cols);
  return new Matrix(matrix, rows, cols);
}

/**
 * Creates a column vector with linearly-spaced elements
 * @param  {float} min minimum value (inclusive)
 * @param  {float} max maximum value (inclusive)
 * @param  {int}   n   number of elements
 * @return {Float64Array}
 */
export function Linspace(min: number, max: number, n: number): Float64Array {
  var matrix = new Float64Array(n);
  var dx = (max - min) / (n - 1);
  for (var i = 0; i < n; ++i) {
    matrix[i] = i * dx + min;
  }
  return matrix;
}

/**
 * Creates a n x n identity matrix
 * @param  {int} n number of rows and columns
 * @return {Float64Array}
 *
 *     const n = 3;
 *     const diagonal = Eye(n);
 */
export function Eye(n: number): Matrix {
  var matrix = new Float64Array(n * n);
  for (var i = 0; i < n; ++i) {
    matrix[i * n + i] = 1;
  }
  return new Matrix(matrix, n, n);
} /**
 * Creates a "matrix" filled with ones
 * @param  {int} rows number of rows
 * @param  {int} cols number of columns
 * @return {Float64Array}
 */

export function Ones(rows: number, cols: number): Matrix {
  cols = cols || 1;
  var matrix = new Float64Array(rows * cols);
  for (var i = 0; i < matrix.length; ++i) {
    matrix[i] = 1;
  }
  return new Matrix(matrix, rows, cols);
} /**
 * Creates a "matrix" filled with constant
 * @param  {float} const constant
 * @param  {int}   rows number of rows
 * @param  {int}   cols number of columns
 * @return {Float64Array}
 */

export function Constant(constant: number, rows: number, cols: number): Matrix {
  cols = cols || 1;
  var matrix = new Float64Array(rows * cols);
  for (var i = 0; i < matrix.length; ++i) {
    matrix[i] = constant;
  }
  return new Matrix(matrix, rows, cols);
} /**
 * Build a "matrix" where each element is a function applied to element index
 * @param  {function} f    takes ([i, [j]]) as arguments
 * @param  {int}      rows number of rows
 * @param  {int}      cols number of cols
 * @return {Float64Array}
 */

export function Build(f: Function, rows: number, cols: number) {
  cols = cols || 1;
  var matrix = Zeros(rows, cols);
  for (var i = 0; i < rows; ++i) {
    for (var j = 0; j < cols; ++j) {
      matrix.data[i * cols + j] = f(i, j);
    }
  }
  return new Matrix(matrix.data, rows, cols);
} /**
 * Outer product (form matrix from vector tensor product)
 * @param  {Float64Array} u vector (column or row)
 * @param  {Float64Array} v vector (column or row)
 * @return {Float64Array}
 */

export function Outer(u: Float64Array, v: Float64Array) {
  var A = Zeros(u.length, v.length);
  for (var i = 0; i < u.length; ++i) {
    for (var j = 0; j < v.length; ++j) {
      A.data[i * v.length + j] = u[i] * v[j];
    }
  }
  return A;
}
