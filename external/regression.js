const toString = Object.prototype.toString;

function isAnyArray(object) {
    return toString.call(object).endsWith("Array]");
}

function max(input) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (!isAnyArray(input)) {
        throw new TypeError("input must be an array");
    }
    if (input.length === 0) {
        throw new TypeError("input must not be empty");
    }
    var _options$fromIndex = options.fromIndex, fromIndex = _options$fromIndex === void 0 ? 0 : _options$fromIndex,
            _options$toIndex = options.toIndex, toIndex = _options$toIndex === void 0 ? input.length : _options$toIndex;
    if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
        throw new Error("fromIndex must be a positive integer smaller than length");
    }
    if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
        throw new Error("toIndex must be an integer greater than fromIndex and at most equal to length");
    }
    var maxValue = input[fromIndex];
    for (var i = fromIndex + 1; i < toIndex; i++) {
        if (input[i] > maxValue) {
            maxValue = input[i];
        }
    }
    return maxValue;
}

function min(input) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (!isAnyArray(input)) {
        throw new TypeError("input must be an array");
    }
    if (input.length === 0) {
        throw new TypeError("input must not be empty");
    }
    var _options$fromIndex = options.fromIndex, fromIndex = _options$fromIndex === void 0 ? 0 : _options$fromIndex,
            _options$toIndex = options.toIndex, toIndex = _options$toIndex === void 0 ? input.length : _options$toIndex;
    if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
        throw new Error("fromIndex must be a positive integer smaller than length");
    }
    if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
        throw new Error("toIndex must be an integer greater than fromIndex and at most equal to length");
    }
    var minValue = input[fromIndex];
    for (var i = fromIndex + 1; i < toIndex; i++) {
        if (input[i] < minValue) {
            minValue = input[i];
        }
    }
    return minValue;
}

function rescale(input) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (!isAnyArray(input)) {
        throw new TypeError("input must be an array");
    } else if (input.length === 0) {
        throw new TypeError("input must not be empty");
    }
    var output;
    if (options.output !== void 0) {
        if (!isAnyArray(options.output)) {
            throw new TypeError("output option must be an array if specified");
        }
        output = options.output;
    } else {
        output = new Array(input.length);
    }
    var currentMin = min(input);
    var currentMax = max(input);
    if (currentMin === currentMax) {
        throw new RangeError("minimum and maximum input values are equal. Cannot rescale a constant array");
    }
    var _options$min = options.min,
            minValue = _options$min === void 0 ? options.autoMinMax ? currentMin : 0 : _options$min,
            _options$max = options.max,
            maxValue = _options$max === void 0 ? options.autoMinMax ? currentMax : 1 : _options$max;
    if (minValue >= maxValue) {
        throw new RangeError("min option must be smaller than max option");
    }
    var factor = (maxValue - minValue) / (currentMax - currentMin);
    for (var i = 0; i < input.length; i++) {
        output[i] = (input[i] - currentMin) * factor + minValue;
    }
    return output;
}

const indent = " ".repeat(2);
const indentData = " ".repeat(4);

function inspectMatrix() {
    return inspectMatrixWithOptions(this);
}

function inspectMatrixWithOptions(matrix, options = {}) {
    const {maxRows = 15, maxColumns = 10, maxNumSize = 8} = options;
    return `${matrix.constructor.name} {\n${indent}[\n${indentData}${inspectData(matrix, maxRows, maxColumns, maxNumSize)}\n${indent}]\n${indent}rows: ${matrix.rows}\n${indent}columns: ${matrix.columns}\n}`;
}

function inspectData(matrix, maxRows, maxColumns, maxNumSize) {
    const {rows, columns} = matrix;
    const maxI = Math.min(rows, maxRows);
    const maxJ = Math.min(columns, maxColumns);
    const result = [];
    for (let i = 0; i < maxI; i++) {
        let line = [];
        for (let j = 0; j < maxJ; j++) {
            line.push(formatNumber(matrix.get(i, j), maxNumSize));
        }
        result.push(`${line.join(" ")}`);
    }
    if (maxJ !== columns) {
        result[result.length - 1] += ` ... ${columns - maxColumns} more columns`;
    }
    if (maxI !== rows) {
        result.push(`... ${rows - maxRows} more rows`);
    }
    return result.join(`\n${indentData}`);
}

function formatNumber(num, maxNumSize) {
    const numStr = String(num);
    if (numStr.length <= maxNumSize) {
        return numStr.padEnd(maxNumSize, " ");
    }
    const precise = num.toPrecision(maxNumSize - 2);
    if (precise.length <= maxNumSize) {
        return precise;
    }
    const exponential = num.toExponential(maxNumSize - 2);
    const eIndex = exponential.indexOf("e");
    const e = exponential.slice(eIndex);
    return exponential.slice(0, maxNumSize - e.length) + e;
}

function installMathOperations(AbstractMatrix2, Matrix2) {
    AbstractMatrix2.prototype.add = function add(value) {
        if (typeof value === "number") {
            return this.addS(value);
        }
        return this.addM(value);
    };
    AbstractMatrix2.prototype.addS = function addS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) + value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.addM = function addM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) + matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.add = function add(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.add(value);
    };
    AbstractMatrix2.prototype.sub = function sub(value) {
        if (typeof value === "number") {
            return this.subS(value);
        }
        return this.subM(value);
    };
    AbstractMatrix2.prototype.subS = function subS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) - value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.subM = function subM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) - matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.sub = function sub(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sub(value);
    };
    AbstractMatrix2.prototype.subtract = AbstractMatrix2.prototype.sub;
    AbstractMatrix2.prototype.subtractS = AbstractMatrix2.prototype.subS;
    AbstractMatrix2.prototype.subtractM = AbstractMatrix2.prototype.subM;
    AbstractMatrix2.subtract = AbstractMatrix2.sub;
    AbstractMatrix2.prototype.mul = function mul(value) {
        if (typeof value === "number") {
            return this.mulS(value);
        }
        return this.mulM(value);
    };
    AbstractMatrix2.prototype.mulS = function mulS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) * value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.mulM = function mulM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) * matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.mul = function mul(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.mul(value);
    };
    AbstractMatrix2.prototype.multiply = AbstractMatrix2.prototype.mul;
    AbstractMatrix2.prototype.multiplyS = AbstractMatrix2.prototype.mulS;
    AbstractMatrix2.prototype.multiplyM = AbstractMatrix2.prototype.mulM;
    AbstractMatrix2.multiply = AbstractMatrix2.mul;
    AbstractMatrix2.prototype.div = function div(value) {
        if (typeof value === "number") {
            return this.divS(value);
        }
        return this.divM(value);
    };
    AbstractMatrix2.prototype.divS = function divS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) / value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.divM = function divM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) / matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.div = function div(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.div(value);
    };
    AbstractMatrix2.prototype.divide = AbstractMatrix2.prototype.div;
    AbstractMatrix2.prototype.divideS = AbstractMatrix2.prototype.divS;
    AbstractMatrix2.prototype.divideM = AbstractMatrix2.prototype.divM;
    AbstractMatrix2.divide = AbstractMatrix2.div;
    AbstractMatrix2.prototype.mod = function mod(value) {
        if (typeof value === "number") {
            return this.modS(value);
        }
        return this.modM(value);
    };
    AbstractMatrix2.prototype.modS = function modS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) % value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.modM = function modM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) % matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.mod = function mod(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.mod(value);
    };
    AbstractMatrix2.prototype.modulus = AbstractMatrix2.prototype.mod;
    AbstractMatrix2.prototype.modulusS = AbstractMatrix2.prototype.modS;
    AbstractMatrix2.prototype.modulusM = AbstractMatrix2.prototype.modM;
    AbstractMatrix2.modulus = AbstractMatrix2.mod;
    AbstractMatrix2.prototype.and = function and(value) {
        if (typeof value === "number") {
            return this.andS(value);
        }
        return this.andM(value);
    };
    AbstractMatrix2.prototype.andS = function andS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) & value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.andM = function andM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) & matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.and = function and(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.and(value);
    };
    AbstractMatrix2.prototype.or = function or(value) {
        if (typeof value === "number") {
            return this.orS(value);
        }
        return this.orM(value);
    };
    AbstractMatrix2.prototype.orS = function orS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) | value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.orM = function orM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) | matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.or = function or(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.or(value);
    };
    AbstractMatrix2.prototype.xor = function xor(value) {
        if (typeof value === "number") {
            return this.xorS(value);
        }
        return this.xorM(value);
    };
    AbstractMatrix2.prototype.xorS = function xorS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) ^ value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.xorM = function xorM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) ^ matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.xor = function xor(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.xor(value);
    };
    AbstractMatrix2.prototype.leftShift = function leftShift(value) {
        if (typeof value === "number") {
            return this.leftShiftS(value);
        }
        return this.leftShiftM(value);
    };
    AbstractMatrix2.prototype.leftShiftS = function leftShiftS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) << value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.leftShiftM = function leftShiftM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) << matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.leftShift = function leftShift(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.leftShift(value);
    };
    AbstractMatrix2.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
        if (typeof value === "number") {
            return this.signPropagatingRightShiftS(value);
        }
        return this.signPropagatingRightShiftM(value);
    };
    AbstractMatrix2.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) >> value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.signPropagatingRightShiftM = function signPropagatingRightShiftM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) >> matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.signPropagatingRightShift = function signPropagatingRightShift(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.signPropagatingRightShift(value);
    };
    AbstractMatrix2.prototype.rightShift = function rightShift(value) {
        if (typeof value === "number") {
            return this.rightShiftS(value);
        }
        return this.rightShiftM(value);
    };
    AbstractMatrix2.prototype.rightShiftS = function rightShiftS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) >>> value);
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.rightShiftM = function rightShiftM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) >>> matrix.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.rightShift = function rightShift(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.rightShift(value);
    };
    AbstractMatrix2.prototype.zeroFillRightShift = AbstractMatrix2.prototype.rightShift;
    AbstractMatrix2.prototype.zeroFillRightShiftS = AbstractMatrix2.prototype.rightShiftS;
    AbstractMatrix2.prototype.zeroFillRightShiftM = AbstractMatrix2.prototype.rightShiftM;
    AbstractMatrix2.zeroFillRightShift = AbstractMatrix2.rightShift;
    AbstractMatrix2.prototype.not = function not() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, ~this.get(i, j));
            }
        }
        return this;
    };
    AbstractMatrix2.not = function not(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.not();
    };
    AbstractMatrix2.prototype.abs = function abs() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.abs(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.abs = function abs(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.abs();
    };
    AbstractMatrix2.prototype.acos = function acos() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.acos(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.acos = function acos(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.acos();
    };
    AbstractMatrix2.prototype.acosh = function acosh() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.acosh(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.acosh = function acosh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.acosh();
    };
    AbstractMatrix2.prototype.asin = function asin() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.asin(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.asin = function asin(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.asin();
    };
    AbstractMatrix2.prototype.asinh = function asinh() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.asinh(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.asinh = function asinh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.asinh();
    };
    AbstractMatrix2.prototype.atan = function atan() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.atan(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.atan = function atan(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.atan();
    };
    AbstractMatrix2.prototype.atanh = function atanh() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.atanh(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.atanh = function atanh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.atanh();
    };
    AbstractMatrix2.prototype.cbrt = function cbrt() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.cbrt(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.cbrt = function cbrt(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.cbrt();
    };
    AbstractMatrix2.prototype.ceil = function ceil() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.ceil(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.ceil = function ceil(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.ceil();
    };
    AbstractMatrix2.prototype.clz32 = function clz32() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.clz32(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.clz32 = function clz32(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.clz32();
    };
    AbstractMatrix2.prototype.cos = function cos() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.cos(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.cos = function cos(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.cos();
    };
    AbstractMatrix2.prototype.cosh = function cosh() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.cosh(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.cosh = function cosh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.cosh();
    };
    AbstractMatrix2.prototype.exp = function exp() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.exp(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.exp = function exp(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.exp();
    };
    AbstractMatrix2.prototype.expm1 = function expm1() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.expm1(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.expm1 = function expm1(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.expm1();
    };
    AbstractMatrix2.prototype.floor = function floor() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.floor(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.floor = function floor(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.floor();
    };
    AbstractMatrix2.prototype.fround = function fround() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.fround(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.fround = function fround(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.fround();
    };
    AbstractMatrix2.prototype.log = function log() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.log(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.log = function log(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log();
    };
    AbstractMatrix2.prototype.log1p = function log1p() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.log1p(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.log1p = function log1p(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log1p();
    };
    AbstractMatrix2.prototype.log10 = function log10() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.log10(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.log10 = function log10(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log10();
    };
    AbstractMatrix2.prototype.log2 = function log2() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.log2(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.log2 = function log2(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log2();
    };
    AbstractMatrix2.prototype.round = function round() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.round(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.round = function round(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.round();
    };
    AbstractMatrix2.prototype.sign = function sign() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.sign(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.sign = function sign(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sign();
    };
    AbstractMatrix2.prototype.sin = function sin() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.sin(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.sin = function sin(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sin();
    };
    AbstractMatrix2.prototype.sinh = function sinh() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.sinh(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.sinh = function sinh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sinh();
    };
    AbstractMatrix2.prototype.sqrt = function sqrt() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.sqrt(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.sqrt = function sqrt(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sqrt();
    };
    AbstractMatrix2.prototype.tan = function tan() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.tan(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.tan = function tan(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.tan();
    };
    AbstractMatrix2.prototype.tanh = function tanh() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.tanh(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.tanh = function tanh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.tanh();
    };
    AbstractMatrix2.prototype.trunc = function trunc() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.trunc(this.get(i, j)));
            }
        }
        return this;
    };
    AbstractMatrix2.trunc = function trunc(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.trunc();
    };
    AbstractMatrix2.pow = function pow(matrix, arg0) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.pow(arg0);
    };
    AbstractMatrix2.prototype.pow = function pow(value) {
        if (typeof value === "number") {
            return this.powS(value);
        }
        return this.powM(value);
    };
    AbstractMatrix2.prototype.powS = function powS(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.pow(this.get(i, j), value));
            }
        }
        return this;
    };
    AbstractMatrix2.prototype.powM = function powM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
            throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, Math.pow(this.get(i, j), matrix.get(i, j)));
            }
        }
        return this;
    };
}

function checkRowIndex(matrix, index, outer) {
    let max1 = outer ? matrix.rows : matrix.rows - 1;
    if (index < 0 || index > max1) {
        throw new RangeError("Row index out of range");
    }
}

function checkColumnIndex(matrix, index, outer) {
    let max1 = outer ? matrix.columns : matrix.columns - 1;
    if (index < 0 || index > max1) {
        throw new RangeError("Column index out of range");
    }
}

function checkRowVector(matrix, vector) {
    if (vector.to1DArray) {
        vector = vector.to1DArray();
    }
    if (vector.length !== matrix.columns) {
        throw new RangeError("vector size must be the same as the number of columns");
    }
    return vector;
}

function checkColumnVector(matrix, vector) {
    if (vector.to1DArray) {
        vector = vector.to1DArray();
    }
    if (vector.length !== matrix.rows) {
        throw new RangeError("vector size must be the same as the number of rows");
    }
    return vector;
}

function checkIndices(matrix, rowIndices, columnIndices) {
    return {
        row: checkRowIndices(matrix, rowIndices),
        column: checkColumnIndices(matrix, columnIndices)
    };
}

function checkRowIndices(matrix, rowIndices) {
    if (typeof rowIndices !== "object") {
        throw new TypeError("unexpected type for row indices");
    }
    let rowOut = rowIndices.some((r) => {
        return r < 0 || r >= matrix.rows;
    });
    if (rowOut) {
        throw new RangeError("row indices are out of range");
    }
    if (!Array.isArray(rowIndices)) {
        rowIndices = Array.from(rowIndices);
    }
    return rowIndices;
}

function checkColumnIndices(matrix, columnIndices) {
    if (typeof columnIndices !== "object") {
        throw new TypeError("unexpected type for column indices");
    }
    let columnOut = columnIndices.some((c) => {
        return c < 0 || c >= matrix.columns;
    });
    if (columnOut) {
        throw new RangeError("column indices are out of range");
    }
    if (!Array.isArray(columnIndices)) {
        columnIndices = Array.from(columnIndices);
    }
    return columnIndices;
}

function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
    if (arguments.length !== 5) {
        throw new RangeError("expected 4 arguments");
    }
    checkNumber("startRow", startRow);
    checkNumber("endRow", endRow);
    checkNumber("startColumn", startColumn);
    checkNumber("endColumn", endColumn);
    if (startRow > endRow || startColumn > endColumn || startRow < 0 || startRow >= matrix.rows || endRow < 0 || endRow >= matrix.rows || startColumn < 0 || startColumn >= matrix.columns || endColumn < 0 || endColumn >= matrix.columns) {
        throw new RangeError("Submatrix indices are out of range");
    }
}

function newArray(length, value = 0) {
    let array = [];
    for (let i = 0; i < length; i++) {
        array.push(value);
    }
    return array;
}

function checkNumber(name, value) {
    if (typeof value !== "number") {
        throw new TypeError(`${name} must be a number`);
    }
}

function checkNonEmpty(matrix) {
    if (matrix.isEmpty()) {
        throw new Error("Empty matrix has no elements to index");
    }
}

function sumByRow(matrix) {
    let sum = newArray(matrix.rows);
    for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
            sum[i] += matrix.get(i, j);
        }
    }
    return sum;
}

function sumByColumn(matrix) {
    let sum = newArray(matrix.columns);
    for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
            sum[j] += matrix.get(i, j);
        }
    }
    return sum;
}

function sumAll(matrix) {
    let v = 0;
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
            v += matrix.get(i, j);
        }
    }
    return v;
}

function productByRow(matrix) {
    let sum = newArray(matrix.rows, 1);
    for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
            sum[i] *= matrix.get(i, j);
        }
    }
    return sum;
}

function productByColumn(matrix) {
    let sum = newArray(matrix.columns, 1);
    for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
            sum[j] *= matrix.get(i, j);
        }
    }
    return sum;
}

function productAll(matrix) {
    let v = 1;
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
            v *= matrix.get(i, j);
        }
    }
    return v;
}

function varianceByRow(matrix, unbiased, mean) {
    const rows = matrix.rows;
    const cols = matrix.columns;
    const variance = [];
    for (let i = 0; i < rows; i++) {
        let sum1 = 0;
        let sum2 = 0;
        let x = 0;
        for (let j = 0; j < cols; j++) {
            x = matrix.get(i, j) - mean[i];
            sum1 += x;
            sum2 += x * x;
        }
        if (unbiased) {
            variance.push((sum2 - sum1 * sum1 / cols) / (cols - 1));
        } else {
            variance.push((sum2 - sum1 * sum1 / cols) / cols);
        }
    }
    return variance;
}

function varianceByColumn(matrix, unbiased, mean) {
    const rows = matrix.rows;
    const cols = matrix.columns;
    const variance = [];
    for (let j = 0; j < cols; j++) {
        let sum1 = 0;
        let sum2 = 0;
        let x = 0;
        for (let i = 0; i < rows; i++) {
            x = matrix.get(i, j) - mean[j];
            sum1 += x;
            sum2 += x * x;
        }
        if (unbiased) {
            variance.push((sum2 - sum1 * sum1 / rows) / (rows - 1));
        } else {
            variance.push((sum2 - sum1 * sum1 / rows) / rows);
        }
    }
    return variance;
}

function varianceAll(matrix, unbiased, mean) {
    const rows = matrix.rows;
    const cols = matrix.columns;
    const size = rows * cols;
    let sum1 = 0;
    let sum2 = 0;
    let x = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            x = matrix.get(i, j) - mean;
            sum1 += x;
            sum2 += x * x;
        }
    }
    if (unbiased) {
        return (sum2 - sum1 * sum1 / size) / (size - 1);
    } else {
        return (sum2 - sum1 * sum1 / size) / size;
    }
}

function centerByRow(matrix, mean) {
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
            matrix.set(i, j, matrix.get(i, j) - mean[i]);
        }
    }
}

function centerByColumn(matrix, mean) {
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
            matrix.set(i, j, matrix.get(i, j) - mean[j]);
        }
    }
}

function centerAll(matrix, mean) {
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
            matrix.set(i, j, matrix.get(i, j) - mean);
        }
    }
}

function getScaleByRow(matrix) {
    const scale = [];
    for (let i = 0; i < matrix.rows; i++) {
        let sum = 0;
        for (let j = 0; j < matrix.columns; j++) {
            sum += Math.pow(matrix.get(i, j), 2) / (matrix.columns - 1);
        }
        scale.push(Math.sqrt(sum));
    }
    return scale;
}

function scaleByRow(matrix, scale) {
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
            matrix.set(i, j, matrix.get(i, j) / scale[i]);
        }
    }
}

function getScaleByColumn(matrix) {
    const scale = [];
    for (let j = 0; j < matrix.columns; j++) {
        let sum = 0;
        for (let i = 0; i < matrix.rows; i++) {
            sum += Math.pow(matrix.get(i, j), 2) / (matrix.rows - 1);
        }
        scale.push(Math.sqrt(sum));
    }
    return scale;
}

function scaleByColumn(matrix, scale) {
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
            matrix.set(i, j, matrix.get(i, j) / scale[j]);
        }
    }
}

function getScaleAll(matrix) {
    const divider = matrix.size - 1;
    let sum = 0;
    for (let j = 0; j < matrix.columns; j++) {
        for (let i = 0; i < matrix.rows; i++) {
            sum += Math.pow(matrix.get(i, j), 2) / divider;
        }
    }
    return Math.sqrt(sum);
}

function scaleAll(matrix, scale) {
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
            matrix.set(i, j, matrix.get(i, j) / scale);
        }
    }
}

class AbstractMatrix {
    get size() {
        return this.rows * this.columns;
    }

    static from1DArray(newRows, newColumns, newData) {
        let length = newRows * newColumns;
        if (length !== newData.length) {
            throw new RangeError("data length does not match given dimensions");
        }
        let newMatrix = new Matrix(newRows, newColumns);
        for (let row = 0; row < newRows; row++) {
            for (let column = 0; column < newColumns; column++) {
                newMatrix.set(row, column, newData[row * newColumns + column]);
            }
        }
        return newMatrix;
    }

    static rowVector(newData) {
        let vector = new Matrix(1, newData.length);
        for (let i = 0; i < newData.length; i++) {
            vector.set(0, i, newData[i]);
        }
        return vector;
    }

    static columnVector(newData) {
        let vector = new Matrix(newData.length, 1);
        for (let i = 0; i < newData.length; i++) {
            vector.set(i, 0, newData[i]);
        }
        return vector;
    }

    static zeros(rows, columns) {
        return new Matrix(rows, columns);
    }

    static ones(rows, columns) {
        return new Matrix(rows, columns).fill(1);
    }

    static rand(rows, columns, options = {}) {
        if (typeof options !== "object") {
            throw new TypeError("options must be an object");
        }
        const {random = Math.random} = options;
        let matrix = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                matrix.set(i, j, random());
            }
        }
        return matrix;
    }

    static randInt(rows, columns, options = {}) {
        if (typeof options !== "object") {
            throw new TypeError("options must be an object");
        }
        const {min: min1 = 0, max: max1 = 1000, random = Math.random} = options;
        if (!Number.isInteger(min1)) {
            throw new TypeError("min must be an integer");
        }
        if (!Number.isInteger(max1)) {
            throw new TypeError("max must be an integer");
        }
        if (min1 >= max1) {
            throw new RangeError("min must be smaller than max");
        }
        let interval = max1 - min1;
        let matrix = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                let value = min1 + Math.round(random() * interval);
                matrix.set(i, j, value);
            }
        }
        return matrix;
    }

    static eye(rows, columns, value) {
        if (columns === void 0) {
            columns = rows;
        }
        if (value === void 0) {
            value = 1;
        }
        let min1 = Math.min(rows, columns);
        let matrix = this.zeros(rows, columns);
        for (let i = 0; i < min1; i++) {
            matrix.set(i, i, value);
        }
        return matrix;
    }

    static diag(data, rows, columns) {
        let l = data.length;
        if (rows === void 0) {
            rows = l;
        }
        if (columns === void 0) {
            columns = rows;
        }
        let min1 = Math.min(l, rows, columns);
        let matrix = this.zeros(rows, columns);
        for (let i = 0; i < min1; i++) {
            matrix.set(i, i, data[i]);
        }
        return matrix;
    }

    static min(matrix1, matrix2) {
        matrix1 = this.checkMatrix(matrix1);
        matrix2 = this.checkMatrix(matrix2);
        let rows = matrix1.rows;
        let columns = matrix1.columns;
        let result = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
            }
        }
        return result;
    }

    static max(matrix1, matrix2) {
        matrix1 = this.checkMatrix(matrix1);
        matrix2 = this.checkMatrix(matrix2);
        let rows = matrix1.rows;
        let columns = matrix1.columns;
        let result = new this(rows, columns);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
            }
        }
        return result;
    }

    static checkMatrix(value) {
        return AbstractMatrix.isMatrix(value) ? value : new Matrix(value);
    }

    static isMatrix(value) {
        return value != null && value.klass === "Matrix";
    }

    apply(callback) {
        if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                callback.call(this, i, j);
            }
        }
        return this;
    }

    to1DArray() {
        let array = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                array.push(this.get(i, j));
            }
        }
        return array;
    }

    to2DArray() {
        let copy = [];
        for (let i = 0; i < this.rows; i++) {
            copy.push([]);
            for (let j = 0; j < this.columns; j++) {
                copy[i].push(this.get(i, j));
            }
        }
        return copy;
    }

    toJSON() {
        return this.to2DArray();
    }

    isRowVector() {
        return this.rows === 1;
    }

    isColumnVector() {
        return this.columns === 1;
    }

    isVector() {
        return this.rows === 1 || this.columns === 1;
    }

    isSquare() {
        return this.rows === this.columns;
    }

    isEmpty() {
        return this.rows === 0 || this.columns === 0;
    }

    isSymmetric() {
        if (this.isSquare()) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j <= i; j++) {
                    if (this.get(i, j) !== this.get(j, i)) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    isEchelonForm() {
        let i = 0;
        let j = 0;
        let previousColumn = -1;
        let isEchelonForm = true;
        let checked = false;
        while (i < this.rows && isEchelonForm) {
            j = 0;
            checked = false;
            while (j < this.columns && checked === false) {
                if (this.get(i, j) === 0) {
                    j++;
                } else if (this.get(i, j) === 1 && j > previousColumn) {
                    checked = true;
                    previousColumn = j;
                } else {
                    isEchelonForm = false;
                    checked = true;
                }
            }
            i++;
        }
        return isEchelonForm;
    }

    isReducedEchelonForm() {
        let i = 0;
        let j = 0;
        let previousColumn = -1;
        let isReducedEchelonForm = true;
        let checked = false;
        while (i < this.rows && isReducedEchelonForm) {
            j = 0;
            checked = false;
            while (j < this.columns && checked === false) {
                if (this.get(i, j) === 0) {
                    j++;
                } else if (this.get(i, j) === 1 && j > previousColumn) {
                    checked = true;
                    previousColumn = j;
                } else {
                    isReducedEchelonForm = false;
                    checked = true;
                }
            }
            for (let k = j + 1; k < this.rows; k++) {
                if (this.get(i, k) !== 0) {
                    isReducedEchelonForm = false;
                }
            }
            i++;
        }
        return isReducedEchelonForm;
    }

    echelonForm() {
        let result = this.clone();
        let h = 0;
        let k = 0;
        while (h < result.rows && k < result.columns) {
            let iMax = h;
            for (let i = h; i < result.rows; i++) {
                if (result.get(i, k) > result.get(iMax, k)) {
                    iMax = i;
                }
            }
            if (result.get(iMax, k) === 0) {
                k++;
            } else {
                result.swapRows(h, iMax);
                let tmp = result.get(h, k);
                for (let j = k; j < result.columns; j++) {
                    result.set(h, j, result.get(h, j) / tmp);
                }
                for (let i1 = h + 1; i1 < result.rows; i1++) {
                    let factor = result.get(i1, k) / result.get(h, k);
                    result.set(i1, k, 0);
                    for (let j1 = k + 1; j1 < result.columns; j1++) {
                        result.set(i1, j1, result.get(i1, j1) - result.get(h, j1) * factor);
                    }
                }
                h++;
                k++;
            }
        }
        return result;
    }

    reducedEchelonForm() {
        let result = this.echelonForm();
        let m = result.columns;
        let n = result.rows;
        let h = n - 1;
        while (h >= 0) {
            if (result.maxRow(h) === 0) {
                h--;
            } else {
                let p = 0;
                let pivot = false;
                while (p < n && pivot === false) {
                    if (result.get(h, p) === 1) {
                        pivot = true;
                    } else {
                        p++;
                    }
                }
                for (let i = 0; i < h; i++) {
                    let factor = result.get(i, p);
                    for (let j = p; j < m; j++) {
                        let tmp = result.get(i, j) - factor * result.get(h, j);
                        result.set(i, j, tmp);
                    }
                }
                h--;
            }
        }
        return result;
    }

    set() {
        throw new Error("set method is unimplemented");
    }

    get() {
        throw new Error("get method is unimplemented");
    }

    repeat(options = {}) {
        if (typeof options !== "object") {
            throw new TypeError("options must be an object");
        }
        const {rows = 1, columns = 1} = options;
        if (!Number.isInteger(rows) || rows <= 0) {
            throw new TypeError("rows must be a positive integer");
        }
        if (!Number.isInteger(columns) || columns <= 0) {
            throw new TypeError("columns must be a positive integer");
        }
        let matrix = new Matrix(this.rows * rows, this.columns * columns);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                matrix.setSubMatrix(this, this.rows * i, this.columns * j);
            }
        }
        return matrix;
    }

    fill(value) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, value);
            }
        }
        return this;
    }

    neg() {
        return this.mulS(-1);
    }

    getRow(index) {
        checkRowIndex(this, index);
        let row = [];
        for (let i = 0; i < this.columns; i++) {
            row.push(this.get(index, i));
        }
        return row;
    }

    getRowVector(index) {
        return Matrix.rowVector(this.getRow(index));
    }

    setRow(index, array) {
        checkRowIndex(this, index);
        array = checkRowVector(this, array);
        for (let i = 0; i < this.columns; i++) {
            this.set(index, i, array[i]);
        }
        return this;
    }

    swapRows(row1, row2) {
        checkRowIndex(this, row1);
        checkRowIndex(this, row2);
        for (let i = 0; i < this.columns; i++) {
            let temp = this.get(row1, i);
            this.set(row1, i, this.get(row2, i));
            this.set(row2, i, temp);
        }
        return this;
    }

    getColumn(index) {
        checkColumnIndex(this, index);
        let column = [];
        for (let i = 0; i < this.rows; i++) {
            column.push(this.get(i, index));
        }
        return column;
    }

    getColumnVector(index) {
        return Matrix.columnVector(this.getColumn(index));
    }

    setColumn(index, array) {
        checkColumnIndex(this, index);
        array = checkColumnVector(this, array);
        for (let i = 0; i < this.rows; i++) {
            this.set(i, index, array[i]);
        }
        return this;
    }

    swapColumns(column1, column2) {
        checkColumnIndex(this, column1);
        checkColumnIndex(this, column2);
        for (let i = 0; i < this.rows; i++) {
            let temp = this.get(i, column1);
            this.set(i, column1, this.get(i, column2));
            this.set(i, column2, temp);
        }
        return this;
    }

    addRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) + vector[j]);
            }
        }
        return this;
    }

    subRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) - vector[j]);
            }
        }
        return this;
    }

    mulRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) * vector[j]);
            }
        }
        return this;
    }

    divRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) / vector[j]);
            }
        }
        return this;
    }

    addColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) + vector[i]);
            }
        }
        return this;
    }

    subColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) - vector[i]);
            }
        }
        return this;
    }

    mulColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) * vector[i]);
            }
        }
        return this;
    }

    divColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.set(i, j, this.get(i, j) / vector[i]);
            }
        }
        return this;
    }

    mulRow(index, value) {
        checkRowIndex(this, index);
        for (let i = 0; i < this.columns; i++) {
            this.set(index, i, this.get(index, i) * value);
        }
        return this;
    }

    mulColumn(index, value) {
        checkColumnIndex(this, index);
        for (let i = 0; i < this.rows; i++) {
            this.set(i, index, this.get(i, index) * value);
        }
        return this;
    }

    max() {
        if (this.isEmpty()) {
            return NaN;
        }
        let v = this.get(0, 0);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.get(i, j) > v) {
                    v = this.get(i, j);
                }
            }
        }
        return v;
    }

    maxIndex() {
        checkNonEmpty(this);
        let v = this.get(0, 0);
        let idx = [
            0,
            0
        ];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.get(i, j) > v) {
                    v = this.get(i, j);
                    idx[0] = i;
                    idx[1] = j;
                }
            }
        }
        return idx;
    }

    min() {
        if (this.isEmpty()) {
            return NaN;
        }
        let v = this.get(0, 0);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.get(i, j) < v) {
                    v = this.get(i, j);
                }
            }
        }
        return v;
    }

    minIndex() {
        checkNonEmpty(this);
        let v = this.get(0, 0);
        let idx = [
            0,
            0
        ];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.get(i, j) < v) {
                    v = this.get(i, j);
                    idx[0] = i;
                    idx[1] = j;
                }
            }
        }
        return idx;
    }

    maxRow(row) {
        checkRowIndex(this, row);
        if (this.isEmpty()) {
            return NaN;
        }
        let v = this.get(row, 0);
        for (let i = 1; i < this.columns; i++) {
            if (this.get(row, i) > v) {
                v = this.get(row, i);
            }
        }
        return v;
    }

    maxRowIndex(row) {
        checkRowIndex(this, row);
        checkNonEmpty(this);
        let v = this.get(row, 0);
        let idx = [
            row,
            0
        ];
        for (let i = 1; i < this.columns; i++) {
            if (this.get(row, i) > v) {
                v = this.get(row, i);
                idx[1] = i;
            }
        }
        return idx;
    }

    minRow(row) {
        checkRowIndex(this, row);
        if (this.isEmpty()) {
            return NaN;
        }
        let v = this.get(row, 0);
        for (let i = 1; i < this.columns; i++) {
            if (this.get(row, i) < v) {
                v = this.get(row, i);
            }
        }
        return v;
    }

    minRowIndex(row) {
        checkRowIndex(this, row);
        checkNonEmpty(this);
        let v = this.get(row, 0);
        let idx = [
            row,
            0
        ];
        for (let i = 1; i < this.columns; i++) {
            if (this.get(row, i) < v) {
                v = this.get(row, i);
                idx[1] = i;
            }
        }
        return idx;
    }

    maxColumn(column) {
        checkColumnIndex(this, column);
        if (this.isEmpty()) {
            return NaN;
        }
        let v = this.get(0, column);
        for (let i = 1; i < this.rows; i++) {
            if (this.get(i, column) > v) {
                v = this.get(i, column);
            }
        }
        return v;
    }

    maxColumnIndex(column) {
        checkColumnIndex(this, column);
        checkNonEmpty(this);
        let v = this.get(0, column);
        let idx = [
            0,
            column
        ];
        for (let i = 1; i < this.rows; i++) {
            if (this.get(i, column) > v) {
                v = this.get(i, column);
                idx[0] = i;
            }
        }
        return idx;
    }

    minColumn(column) {
        checkColumnIndex(this, column);
        if (this.isEmpty()) {
            return NaN;
        }
        let v = this.get(0, column);
        for (let i = 1; i < this.rows; i++) {
            if (this.get(i, column) < v) {
                v = this.get(i, column);
            }
        }
        return v;
    }

    minColumnIndex(column) {
        checkColumnIndex(this, column);
        checkNonEmpty(this);
        let v = this.get(0, column);
        let idx = [
            0,
            column
        ];
        for (let i = 1; i < this.rows; i++) {
            if (this.get(i, column) < v) {
                v = this.get(i, column);
                idx[0] = i;
            }
        }
        return idx;
    }

    diag() {
        let min1 = Math.min(this.rows, this.columns);
        let diag = [];
        for (let i = 0; i < min1; i++) {
            diag.push(this.get(i, i));
        }
        return diag;
    }

    norm(type = "frobenius") {
        let result = 0;
        if (type === "max") {
            return this.max();
        } else if (type === "frobenius") {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.columns; j++) {
                    result = result + this.get(i, j) * this.get(i, j);
                }
            }
            return Math.sqrt(result);
        } else {
            throw new RangeError(`unknown norm type: ${type}`);
        }
    }

    cumulativeSum() {
        let sum = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                sum += this.get(i, j);
                this.set(i, j, sum);
            }
        }
        return this;
    }

    dot(vector2) {
        if (AbstractMatrix.isMatrix(vector2)) {
            vector2 = vector2.to1DArray();
        }
        let vector1 = this.to1DArray();
        if (vector1.length !== vector2.length) {
            throw new RangeError("vectors do not have the same size");
        }
        let dot = 0;
        for (let i = 0; i < vector1.length; i++) {
            dot += vector1[i] * vector2[i];
        }
        return dot;
    }

    mmul(other) {
        other = Matrix.checkMatrix(other);
        let m = this.rows;
        let n = this.columns;
        let p = other.columns;
        let result = new Matrix(m, p);
        let Bcolj = new Float64Array(n);
        for (let j = 0; j < p; j++) {
            for (let k = 0; k < n; k++) {
                Bcolj[k] = other.get(k, j);
            }
            for (let i = 0; i < m; i++) {
                let s = 0;
                for (let k1 = 0; k1 < n; k1++) {
                    s += this.get(i, k1) * Bcolj[k1];
                }
                result.set(i, j, s);
            }
        }
        return result;
    }

    strassen2x2(other) {
        other = Matrix.checkMatrix(other);
        let result = new Matrix(2, 2);
        const a11 = this.get(0, 0);
        const b11 = other.get(0, 0);
        const a12 = this.get(0, 1);
        const b12 = other.get(0, 1);
        const a21 = this.get(1, 0);
        const b21 = other.get(1, 0);
        const a22 = this.get(1, 1);
        const b22 = other.get(1, 1);
        const m1 = (a11 + a22) * (b11 + b22);
        const m2 = (a21 + a22) * b11;
        const m3 = a11 * (b12 - b22);
        const m4 = a22 * (b21 - b11);
        const m5 = (a11 + a12) * b22;
        const m6 = (a21 - a11) * (b11 + b12);
        const m7 = (a12 - a22) * (b21 + b22);
        const c00 = m1 + m4 - m5 + m7;
        const c01 = m3 + m5;
        const c10 = m2 + m4;
        const c11 = m1 - m2 + m3 + m6;
        result.set(0, 0, c00);
        result.set(0, 1, c01);
        result.set(1, 0, c10);
        result.set(1, 1, c11);
        return result;
    }

    strassen3x3(other) {
        other = Matrix.checkMatrix(other);
        let result = new Matrix(3, 3);
        const a00 = this.get(0, 0);
        const a01 = this.get(0, 1);
        const a02 = this.get(0, 2);
        const a10 = this.get(1, 0);
        const a11 = this.get(1, 1);
        const a12 = this.get(1, 2);
        const a20 = this.get(2, 0);
        const a21 = this.get(2, 1);
        const a22 = this.get(2, 2);
        const b00 = other.get(0, 0);
        const b01 = other.get(0, 1);
        const b02 = other.get(0, 2);
        const b10 = other.get(1, 0);
        const b11 = other.get(1, 1);
        const b12 = other.get(1, 2);
        const b20 = other.get(2, 0);
        const b21 = other.get(2, 1);
        const b22 = other.get(2, 2);
        const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
        const m2 = (a00 - a10) * (-b01 + b11);
        const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
        const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
        const m5 = (a10 + a11) * (-b00 + b01);
        const m6 = a00 * b00;
        const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
        const m8 = (-a00 + a20) * (b02 - b12);
        const m9 = (a20 + a21) * (-b00 + b02);
        const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
        const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
        const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
        const m13 = (a02 - a22) * (b11 - b21);
        const m14 = a02 * b20;
        const m15 = (a21 + a22) * (-b20 + b21);
        const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
        const m17 = (a02 - a12) * (b12 - b22);
        const m18 = (a11 + a12) * (-b20 + b22);
        const m19 = a01 * b10;
        const m20 = a12 * b21;
        const m21 = a10 * b02;
        const m22 = a20 * b01;
        const m23 = a22 * b22;
        const c00 = m6 + m14 + m19;
        const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
        const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
        const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
        const c11 = m2 + m4 + m5 + m6 + m20;
        const c12 = m14 + m16 + m17 + m18 + m21;
        const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
        const c21 = m12 + m13 + m14 + m15 + m22;
        const c22 = m6 + m7 + m8 + m9 + m23;
        result.set(0, 0, c00);
        result.set(0, 1, c01);
        result.set(0, 2, c02);
        result.set(1, 0, c10);
        result.set(1, 1, c11);
        result.set(1, 2, c12);
        result.set(2, 0, c20);
        result.set(2, 1, c21);
        result.set(2, 2, c22);
        return result;
    }

    mmulStrassen(y) {
        y = Matrix.checkMatrix(y);
        let x = this.clone();
        let r1 = x.rows;
        let c1 = x.columns;
        let r2 = y.rows;
        let c2 = y.columns;
        if (c1 !== r2) {
            console.warn(`Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`);
        }

        function embed(mat, rows, cols) {
            let r3 = mat.rows;
            let c3 = mat.columns;
            if (r3 === rows && c3 === cols) {
                return mat;
            } else {
                let resultat = AbstractMatrix.zeros(rows, cols);
                resultat = resultat.setSubMatrix(mat, 0, 0);
                return resultat;
            }
        }

        let r = Math.max(r1, r2);
        let c = Math.max(c1, c2);
        x = embed(x, r, c);
        y = embed(y, r, c);

        function blockMult(a, b, rows, cols) {
            if (rows <= 512 || cols <= 512) {
                return a.mmul(b);
            }
            if (rows % 2 === 1 && cols % 2 === 1) {
                a = embed(a, rows + 1, cols + 1);
                b = embed(b, rows + 1, cols + 1);
            } else if (rows % 2 === 1) {
                a = embed(a, rows + 1, cols);
                b = embed(b, rows + 1, cols);
            } else if (cols % 2 === 1) {
                a = embed(a, rows, cols + 1);
                b = embed(b, rows, cols + 1);
            }
            let halfRows = parseInt(a.rows / 2, 10);
            let halfCols = parseInt(a.columns / 2, 10);
            let a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
            let b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);
            let a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
            let b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);
            let a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
            let b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);
            let a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
            let b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);
            let m1 = blockMult(AbstractMatrix.add(a11, a22), AbstractMatrix.add(b11, b22), halfRows, halfCols);
            let m2 = blockMult(AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
            let m3 = blockMult(a11, AbstractMatrix.sub(b12, b22), halfRows, halfCols);
            let m4 = blockMult(a22, AbstractMatrix.sub(b21, b11), halfRows, halfCols);
            let m5 = blockMult(AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
            let m6 = blockMult(AbstractMatrix.sub(a21, a11), AbstractMatrix.add(b11, b12), halfRows, halfCols);
            let m7 = blockMult(AbstractMatrix.sub(a12, a22), AbstractMatrix.add(b21, b22), halfRows, halfCols);
            let c11 = AbstractMatrix.add(m1, m4);
            c11.sub(m5);
            c11.add(m7);
            let c12 = AbstractMatrix.add(m3, m5);
            let c21 = AbstractMatrix.add(m2, m4);
            let c22 = AbstractMatrix.sub(m1, m2);
            c22.add(m3);
            c22.add(m6);
            let resultat = AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
            resultat = resultat.setSubMatrix(c11, 0, 0);
            resultat = resultat.setSubMatrix(c12, c11.rows, 0);
            resultat = resultat.setSubMatrix(c21, 0, c11.columns);
            resultat = resultat.setSubMatrix(c22, c11.rows, c11.columns);
            return resultat.subMatrix(0, rows - 1, 0, cols - 1);
        }

        return blockMult(x, y, r, c);
    }

    scaleRows(options = {}) {
        if (typeof options !== "object") {
            throw new TypeError("options must be an object");
        }
        const {min: min1 = 0, max: max1 = 1} = options;
        if (!Number.isFinite(min1)) {
            throw new TypeError("min must be a number");
        }
        if (!Number.isFinite(max1)) {
            throw new TypeError("max must be a number");
        }
        if (min1 >= max1) {
            throw new RangeError("min must be smaller than max");
        }
        let newMatrix = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.rows; i++) {
            const row = this.getRow(i);
            if (row.length > 0) {
                rescale(row, {
                    min: min1,
                    max: max1,
                    output: row
                });
            }
            newMatrix.setRow(i, row);
        }
        return newMatrix;
    }

    scaleColumns(options = {}) {
        if (typeof options !== "object") {
            throw new TypeError("options must be an object");
        }
        const {min: min1 = 0, max: max1 = 1} = options;
        if (!Number.isFinite(min1)) {
            throw new TypeError("min must be a number");
        }
        if (!Number.isFinite(max1)) {
            throw new TypeError("max must be a number");
        }
        if (min1 >= max1) {
            throw new RangeError("min must be smaller than max");
        }
        let newMatrix = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.columns; i++) {
            const column = this.getColumn(i);
            if (column.length) {
                rescale(column, {
                    min: min1,
                    max: max1,
                    output: column
                });
            }
            newMatrix.setColumn(i, column);
        }
        return newMatrix;
    }

    flipRows() {
        const middle = Math.ceil(this.columns / 2);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < middle; j++) {
                let first = this.get(i, j);
                let last = this.get(i, this.columns - 1 - j);
                this.set(i, j, last);
                this.set(i, this.columns - 1 - j, first);
            }
        }
        return this;
    }

    flipColumns() {
        const middle = Math.ceil(this.rows / 2);
        for (let j = 0; j < this.columns; j++) {
            for (let i = 0; i < middle; i++) {
                let first = this.get(i, j);
                let last = this.get(this.rows - 1 - i, j);
                this.set(i, j, last);
                this.set(this.rows - 1 - i, j, first);
            }
        }
        return this;
    }

    kroneckerProduct(other) {
        other = Matrix.checkMatrix(other);
        let m = this.rows;
        let n = this.columns;
        let p = other.rows;
        let q = other.columns;
        let result = new Matrix(m * p, n * q);
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < p; k++) {
                    for (let l = 0; l < q; l++) {
                        result.set(p * i + k, q * j + l, this.get(i, j) * other.get(k, l));
                    }
                }
            }
        }
        return result;
    }

    kroneckerSum(other) {
        other = Matrix.checkMatrix(other);
        if (!this.isSquare() || !other.isSquare()) {
            throw new Error("Kronecker Sum needs two Square Matrices");
        }
        let m = this.rows;
        let n = other.rows;
        let AxI = this.kroneckerProduct(Matrix.eye(n, n));
        let IxB = Matrix.eye(m, m).kroneckerProduct(other);
        return AxI.add(IxB);
    }

    transpose() {
        let result = new Matrix(this.columns, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                result.set(j, i, this.get(i, j));
            }
        }
        return result;
    }

    sortRows(compareFunction = compareNumbers) {
        for (let i = 0; i < this.rows; i++) {
            this.setRow(i, this.getRow(i).sort(compareFunction));
        }
        return this;
    }

    sortColumns(compareFunction = compareNumbers) {
        for (let i = 0; i < this.columns; i++) {
            this.setColumn(i, this.getColumn(i).sort(compareFunction));
        }
        return this;
    }

    subMatrix(startRow, endRow, startColumn, endColumn) {
        checkRange(this, startRow, endRow, startColumn, endColumn);
        let newMatrix = new Matrix(endRow - startRow + 1, endColumn - startColumn + 1);
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                newMatrix.set(i - startRow, j - startColumn, this.get(i, j));
            }
        }
        return newMatrix;
    }

    subMatrixRow(indices, startColumn, endColumn) {
        if (startColumn === void 0) {
            startColumn = 0;
        }
        if (endColumn === void 0) {
            endColumn = this.columns - 1;
        }
        if (startColumn > endColumn || startColumn < 0 || startColumn >= this.columns || endColumn < 0 || endColumn >= this.columns) {
            throw new RangeError("Argument out of range");
        }
        let newMatrix = new Matrix(indices.length, endColumn - startColumn + 1);
        for (let i = 0; i < indices.length; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                if (indices[i] < 0 || indices[i] >= this.rows) {
                    throw new RangeError(`Row index out of range: ${indices[i]}`);
                }
                newMatrix.set(i, j - startColumn, this.get(indices[i], j));
            }
        }
        return newMatrix;
    }

    subMatrixColumn(indices, startRow, endRow) {
        if (startRow === void 0) {
            startRow = 0;
        }
        if (endRow === void 0) {
            endRow = this.rows - 1;
        }
        if (startRow > endRow || startRow < 0 || startRow >= this.rows || endRow < 0 || endRow >= this.rows) {
            throw new RangeError("Argument out of range");
        }
        let newMatrix = new Matrix(endRow - startRow + 1, indices.length);
        for (let i = 0; i < indices.length; i++) {
            for (let j = startRow; j <= endRow; j++) {
                if (indices[i] < 0 || indices[i] >= this.columns) {
                    throw new RangeError(`Column index out of range: ${indices[i]}`);
                }
                newMatrix.set(j - startRow, i, this.get(j, indices[i]));
            }
        }
        return newMatrix;
    }

    setSubMatrix(matrix, startRow, startColumn) {
        matrix = Matrix.checkMatrix(matrix);
        if (matrix.isEmpty()) {
            return this;
        }
        let endRow = startRow + matrix.rows - 1;
        let endColumn = startColumn + matrix.columns - 1;
        checkRange(this, startRow, endRow, startColumn, endColumn);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.columns; j++) {
                this.set(startRow + i, startColumn + j, matrix.get(i, j));
            }
        }
        return this;
    }

    selection(rowIndices, columnIndices) {
        let indices = checkIndices(this, rowIndices, columnIndices);
        let newMatrix = new Matrix(rowIndices.length, columnIndices.length);
        for (let i = 0; i < indices.row.length; i++) {
            let rowIndex = indices.row[i];
            for (let j = 0; j < indices.column.length; j++) {
                let columnIndex = indices.column[j];
                newMatrix.set(i, j, this.get(rowIndex, columnIndex));
            }
        }
        return newMatrix;
    }

    trace() {
        let min1 = Math.min(this.rows, this.columns);
        let trace = 0;
        for (let i = 0; i < min1; i++) {
            trace += this.get(i, i);
        }
        return trace;
    }

    clone() {
        let newMatrix = new Matrix(this.rows, this.columns);
        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
                newMatrix.set(row, column, this.get(row, column));
            }
        }
        return newMatrix;
    }

    sum(by) {
        switch (by) {
            case "row":
                return sumByRow(this);
            case "column":
                return sumByColumn(this);
            case void 0:
                return sumAll(this);
            default:
                throw new Error(`invalid option: ${by}`);
        }
    }

    product(by) {
        switch (by) {
            case "row":
                return productByRow(this);
            case "column":
                return productByColumn(this);
            case void 0:
                return productAll(this);
            default:
                throw new Error(`invalid option: ${by}`);
        }
    }

    mean(by) {
        const sum = this.sum(by);
        switch (by) {
            case "row": {
                for (let i = 0; i < this.rows; i++) {
                    sum[i] /= this.columns;
                }
                return sum;
            }
            case "column": {
                for (let i = 0; i < this.columns; i++) {
                    sum[i] /= this.rows;
                }
                return sum;
            }
            case void 0:
                return sum / this.size;
            default:
                throw new Error(`invalid option: ${by}`);
        }
    }

    variance(by, options = {}) {
        if (typeof by === "object") {
            options = by;
            by = void 0;
        }
        if (typeof options !== "object") {
            throw new TypeError("options must be an object");
        }
        const {unbiased = true, mean = this.mean(by)} = options;
        if (typeof unbiased !== "boolean") {
            throw new TypeError("unbiased must be a boolean");
        }
        switch (by) {
            case "row": {
                if (!Array.isArray(mean)) {
                    throw new TypeError("mean must be an array");
                }
                return varianceByRow(this, unbiased, mean);
            }
            case "column": {
                if (!Array.isArray(mean)) {
                    throw new TypeError("mean must be an array");
                }
                return varianceByColumn(this, unbiased, mean);
            }
            case void 0: {
                if (typeof mean !== "number") {
                    throw new TypeError("mean must be a number");
                }
                return varianceAll(this, unbiased, mean);
            }
            default:
                throw new Error(`invalid option: ${by}`);
        }
    }

    standardDeviation(by, options) {
        if (typeof by === "object") {
            options = by;
            by = void 0;
        }
        const variance = this.variance(by, options);
        if (by === void 0) {
            return Math.sqrt(variance);
        } else {
            for (let i = 0; i < variance.length; i++) {
                variance[i] = Math.sqrt(variance[i]);
            }
            return variance;
        }
    }

    center(by, options = {}) {
        if (typeof by === "object") {
            options = by;
            by = void 0;
        }
        if (typeof options !== "object") {
            throw new TypeError("options must be an object");
        }
        const {center = this.mean(by)} = options;
        switch (by) {
            case "row": {
                if (!Array.isArray(center)) {
                    throw new TypeError("center must be an array");
                }
                centerByRow(this, center);
                return this;
            }
            case "column": {
                if (!Array.isArray(center)) {
                    throw new TypeError("center must be an array");
                }
                centerByColumn(this, center);
                return this;
            }
            case void 0: {
                if (typeof center !== "number") {
                    throw new TypeError("center must be a number");
                }
                centerAll(this, center);
                return this;
            }
            default:
                throw new Error(`invalid option: ${by}`);
        }
    }

    scale(by, options = {}) {
        if (typeof by === "object") {
            options = by;
            by = void 0;
        }
        if (typeof options !== "object") {
            throw new TypeError("options must be an object");
        }
        let scale = options.scale;
        switch (by) {
            case "row": {
                if (scale === void 0) {
                    scale = getScaleByRow(this);
                } else if (!Array.isArray(scale)) {
                    throw new TypeError("scale must be an array");
                }
                scaleByRow(this, scale);
                return this;
            }
            case "column": {
                if (scale === void 0) {
                    scale = getScaleByColumn(this);
                } else if (!Array.isArray(scale)) {
                    throw new TypeError("scale must be an array");
                }
                scaleByColumn(this, scale);
                return this;
            }
            case void 0: {
                if (scale === void 0) {
                    scale = getScaleAll(this);
                } else if (typeof scale !== "number") {
                    throw new TypeError("scale must be a number");
                }
                scaleAll(this, scale);
                return this;
            }
            default:
                throw new Error(`invalid option: ${by}`);
        }
    }

    toString(options) {
        return inspectMatrixWithOptions(this, options);
    }
}

AbstractMatrix.prototype.klass = "Matrix";
if (typeof Symbol !== "undefined") {
    AbstractMatrix.prototype[Symbol.for("nodejs.util.inspect.custom")] = inspectMatrix;
}

function compareNumbers(a, b) {
    return a - b;
}

AbstractMatrix.random = AbstractMatrix.rand;
AbstractMatrix.randomInt = AbstractMatrix.randInt;
AbstractMatrix.diagonal = AbstractMatrix.diag;
AbstractMatrix.prototype.diagonal = AbstractMatrix.prototype.diag;
AbstractMatrix.identity = AbstractMatrix.eye;
AbstractMatrix.prototype.negate = AbstractMatrix.prototype.neg;
AbstractMatrix.prototype.tensorProduct = AbstractMatrix.prototype.kroneckerProduct;

class Matrix extends AbstractMatrix {
    constructor(nRows, nColumns) {
        super();
        if (Matrix.isMatrix(nRows)) {
            return nRows.clone();
        } else if (Number.isInteger(nRows) && nRows >= 0) {
            this.data = [];
            if (Number.isInteger(nColumns) && nColumns >= 0) {
                for (let i = 0; i < nRows; i++) {
                    this.data.push(new Float64Array(nColumns));
                }
            } else {
                throw new TypeError("nColumns must be a positive integer");
            }
        } else if (Array.isArray(nRows)) {
            const arrayData = nRows;
            nRows = arrayData.length;
            nColumns = nRows ? arrayData[0].length : 0;
            if (typeof nColumns !== "number") {
                throw new TypeError("Data must be a 2D array with at least one element");
            }
            this.data = [];
            for (let i = 0; i < nRows; i++) {
                if (arrayData[i].length !== nColumns) {
                    throw new RangeError("Inconsistent array dimensions");
                }
                this.data.push(Float64Array.from(arrayData[i]));
            }
        } else {
            throw new TypeError("First argument must be a positive number or an array");
        }
        this.rows = nRows;
        this.columns = nColumns;
    }

    set(rowIndex, columnIndex, value) {
        this.data[rowIndex][columnIndex] = value;
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.data[rowIndex][columnIndex];
    }

    removeRow(index) {
        checkRowIndex(this, index);
        this.data.splice(index, 1);
        this.rows -= 1;
        return this;
    }

    addRow(index, array) {
        if (array === void 0) {
            array = index;
            index = this.rows;
        }
        checkRowIndex(this, index, true);
        array = Float64Array.from(checkRowVector(this, array));
        this.data.splice(index, 0, array);
        this.rows += 1;
        return this;
    }

    removeColumn(index) {
        checkColumnIndex(this, index);
        for (let i = 0; i < this.rows; i++) {
            const newRow = new Float64Array(this.columns - 1);
            for (let j = 0; j < index; j++) {
                newRow[j] = this.data[i][j];
            }
            for (let j1 = index + 1; j1 < this.columns; j1++) {
                newRow[j1 - 1] = this.data[i][j1];
            }
            this.data[i] = newRow;
        }
        this.columns -= 1;
        return this;
    }

    addColumn(index, array) {
        if (typeof array === "undefined") {
            array = index;
            index = this.columns;
        }
        checkColumnIndex(this, index, true);
        array = checkColumnVector(this, array);
        for (let i = 0; i < this.rows; i++) {
            const newRow = new Float64Array(this.columns + 1);
            let j = 0;
            for (; j < index; j++) {
                newRow[j] = this.data[i][j];
            }
            newRow[j++] = array[i];
            for (; j < this.columns + 1; j++) {
                newRow[j] = this.data[i][j - 1];
            }
            this.data[i] = newRow;
        }
        this.columns += 1;
        return this;
    }
}

installMathOperations(AbstractMatrix, Matrix);

class BaseView extends AbstractMatrix {
    constructor(matrix, rows, columns) {
        super();
        this.matrix = matrix;
        this.rows = rows;
        this.columns = columns;
    }
}

class MatrixColumnView extends BaseView {
    constructor(matrix1, column1) {
        checkColumnIndex(matrix1, column1);
        super(matrix1, matrix1.rows, 1);
        this.column = column1;
    }

    set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.column, value);
        return this;
    }

    get(rowIndex) {
        return this.matrix.get(rowIndex, this.column);
    }
}

class MatrixColumnSelectionView extends BaseView {
    constructor(matrix2, columnIndices) {
        columnIndices = checkColumnIndices(matrix2, columnIndices);
        super(matrix2, matrix2.rows, columnIndices.length);
        this.columnIndices = columnIndices;
    }

    set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
    }
}

class MatrixFlipColumnView extends BaseView {
    constructor(matrix3) {
        super(matrix3, matrix3.rows, matrix3.columns);
    }

    set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
    }
}

class MatrixFlipRowView extends BaseView {
    constructor(matrix4) {
        super(matrix4, matrix4.rows, matrix4.columns);
    }

    set(rowIndex, columnIndex, value) {
        this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
    }
}

class MatrixRowView extends BaseView {
    constructor(matrix5, row1) {
        checkRowIndex(matrix5, row1);
        super(matrix5, 1, matrix5.columns);
        this.row = row1;
    }

    set(rowIndex, columnIndex, value) {
        this.matrix.set(this.row, columnIndex, value);
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.matrix.get(this.row, columnIndex);
    }
}

class MatrixRowSelectionView extends BaseView {
    constructor(matrix6, rowIndices) {
        rowIndices = checkRowIndices(matrix6, rowIndices);
        super(matrix6, rowIndices.length, matrix6.columns);
        this.rowIndices = rowIndices;
    }

    set(rowIndex, columnIndex, value) {
        this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
    }
}

class MatrixSelectionView extends BaseView {
    constructor(matrix7, rowIndices1, columnIndices1) {
        let indices = checkIndices(matrix7, rowIndices1, columnIndices1);
        super(matrix7, indices.row.length, indices.column.length);
        this.rowIndices = indices.row;
        this.columnIndices = indices.column;
    }

    set(rowIndex, columnIndex, value) {
        this.matrix.set(this.rowIndices[rowIndex], this.columnIndices[columnIndex], value);
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.matrix.get(this.rowIndices[rowIndex], this.columnIndices[columnIndex]);
    }
}

class MatrixSubView extends BaseView {
    constructor(matrix8, startRow, endRow, startColumn, endColumn) {
        checkRange(matrix8, startRow, endRow, startColumn, endColumn);
        super(matrix8, endRow - startRow + 1, endColumn - startColumn + 1);
        this.startRow = startRow;
        this.startColumn = startColumn;
    }

    set(rowIndex, columnIndex, value) {
        this.matrix.set(this.startRow + rowIndex, this.startColumn + columnIndex, value);
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.matrix.get(this.startRow + rowIndex, this.startColumn + columnIndex);
    }
}

class MatrixTransposeView extends BaseView {
    constructor(matrix9) {
        super(matrix9, matrix9.columns, matrix9.rows);
    }

    set(rowIndex, columnIndex, value) {
        this.matrix.set(columnIndex, rowIndex, value);
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.matrix.get(columnIndex, rowIndex);
    }
}

class WrapperMatrix1D extends AbstractMatrix {
    constructor(data, options = {}) {
        const {rows: rows1 = 1} = options;
        if (data.length % rows1 !== 0) {
            throw new Error("the data length is not divisible by the number of rows");
        }
        super();
        this.rows = rows1;
        this.columns = data.length / rows1;
        this.data = data;
    }

    set(rowIndex, columnIndex, value) {
        let index = this._calculateIndex(rowIndex, columnIndex);
        this.data[index] = value;
        return this;
    }

    get(rowIndex, columnIndex) {
        let index = this._calculateIndex(rowIndex, columnIndex);
        return this.data[index];
    }

    _calculateIndex(row, column) {
        return row * this.columns + column;
    }
}

class WrapperMatrix2D extends AbstractMatrix {
    constructor(data1) {
        super();
        this.data = data1;
        this.rows = data1.length;
        this.columns = data1[0].length;
    }

    set(rowIndex, columnIndex, value) {
        this.data[rowIndex][columnIndex] = value;
        return this;
    }

    get(rowIndex, columnIndex) {
        return this.data[rowIndex][columnIndex];
    }
}

class LuDecomposition {
    constructor(matrix10) {
        matrix10 = WrapperMatrix2D.checkMatrix(matrix10);
        let lu = matrix10.clone();
        let rows2 = lu.rows;
        let columns1 = lu.columns;
        let pivotVector = new Float64Array(rows2);
        let pivotSign = 1;
        let i, j, k, p, s, t, v;
        let LUcolj, kmax;
        for (i = 0; i < rows2; i++) {
            pivotVector[i] = i;
        }
        LUcolj = new Float64Array(rows2);
        for (j = 0; j < columns1; j++) {
            for (i = 0; i < rows2; i++) {
                LUcolj[i] = lu.get(i, j);
            }
            for (i = 0; i < rows2; i++) {
                kmax = Math.min(i, j);
                s = 0;
                for (k = 0; k < kmax; k++) {
                    s += lu.get(i, k) * LUcolj[k];
                }
                LUcolj[i] -= s;
                lu.set(i, j, LUcolj[i]);
            }
            p = j;
            for (i = j + 1; i < rows2; i++) {
                if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
                    p = i;
                }
            }
            if (p !== j) {
                for (k = 0; k < columns1; k++) {
                    t = lu.get(p, k);
                    lu.set(p, k, lu.get(j, k));
                    lu.set(j, k, t);
                }
                v = pivotVector[p];
                pivotVector[p] = pivotVector[j];
                pivotVector[j] = v;
                pivotSign = -pivotSign;
            }
            if (j < rows2 && lu.get(j, j) !== 0) {
                for (i = j + 1; i < rows2; i++) {
                    lu.set(i, j, lu.get(i, j) / lu.get(j, j));
                }
            }
        }
        this.LU = lu;
        this.pivotVector = pivotVector;
        this.pivotSign = pivotSign;
    }

    get determinant() {
        let data2 = this.LU;
        if (!data2.isSquare()) {
            throw new Error("Matrix must be square");
        }
        let determinant2 = this.pivotSign;
        let col = data2.columns;
        for (let j1 = 0; j1 < col; j1++) {
            determinant2 *= data2.get(j1, j1);
        }
        return determinant2;
    }

    get lowerTriangularMatrix() {
        let data2 = this.LU;
        let rows3 = data2.rows;
        let columns2 = data2.columns;
        let X = new Matrix(rows3, columns2);
        for (let i1 = 0; i1 < rows3; i1++) {
            for (let j1 = 0; j1 < columns2; j1++) {
                if (i1 > j1) {
                    X.set(i1, j1, data2.get(i1, j1));
                } else if (i1 === j1) {
                    X.set(i1, j1, 1);
                } else {
                    X.set(i1, j1, 0);
                }
            }
        }
        return X;
    }

    get upperTriangularMatrix() {
        let data2 = this.LU;
        let rows3 = data2.rows;
        let columns2 = data2.columns;
        let X = new Matrix(rows3, columns2);
        for (let i1 = 0; i1 < rows3; i1++) {
            for (let j1 = 0; j1 < columns2; j1++) {
                if (i1 <= j1) {
                    X.set(i1, j1, data2.get(i1, j1));
                } else {
                    X.set(i1, j1, 0);
                }
            }
        }
        return X;
    }

    get pivotPermutationVector() {
        return Array.from(this.pivotVector);
    }

    isSingular() {
        let data2 = this.LU;
        let col = data2.columns;
        for (let j1 = 0; j1 < col; j1++) {
            if (data2.get(j1, j1) === 0) {
                return true;
            }
        }
        return false;
    }

    solve(value) {
        value = Matrix.checkMatrix(value);
        let lu1 = this.LU;
        let rows3 = lu1.rows;
        if (rows3 !== value.rows) {
            throw new Error("Invalid matrix dimensions");
        }
        if (this.isSingular()) {
            throw new Error("LU matrix is singular");
        }
        let count = value.columns;
        let X = value.subMatrixRow(this.pivotVector, 0, count - 1);
        let columns2 = lu1.columns;
        let i1, j1, k1;
        for (k1 = 0; k1 < columns2; k1++) {
            for (i1 = k1 + 1; i1 < columns2; i1++) {
                for (j1 = 0; j1 < count; j1++) {
                    X.set(i1, j1, X.get(i1, j1) - X.get(k1, j1) * lu1.get(i1, k1));
                }
            }
        }
        for (k1 = columns2 - 1; k1 >= 0; k1--) {
            for (j1 = 0; j1 < count; j1++) {
                X.set(k1, j1, X.get(k1, j1) / lu1.get(k1, k1));
            }
            for (i1 = 0; i1 < k1; i1++) {
                for (j1 = 0; j1 < count; j1++) {
                    X.set(i1, j1, X.get(i1, j1) - X.get(k1, j1) * lu1.get(i1, k1));
                }
            }
        }
        return X;
    }
}

function hypotenuse(a, b) {
    let r = 0;
    if (Math.abs(a) > Math.abs(b)) {
        r = b / a;
        return Math.abs(a) * Math.sqrt(1 + r * r);
    }
    if (b !== 0) {
        r = a / b;
        return Math.abs(b) * Math.sqrt(1 + r * r);
    }
    return 0;
}

class QrDecomposition {
    constructor(value1) {
        value1 = WrapperMatrix2D.checkMatrix(value1);
        let qr = value1.clone();
        let m = value1.rows;
        let n = value1.columns;
        let rdiag = new Float64Array(n);
        let i1, j1, k1, s1;
        for (k1 = 0; k1 < n; k1++) {
            let nrm = 0;
            for (i1 = k1; i1 < m; i1++) {
                nrm = hypotenuse(nrm, qr.get(i1, k1));
            }
            if (nrm !== 0) {
                if (qr.get(k1, k1) < 0) {
                    nrm = -nrm;
                }
                for (i1 = k1; i1 < m; i1++) {
                    qr.set(i1, k1, qr.get(i1, k1) / nrm);
                }
                qr.set(k1, k1, qr.get(k1, k1) + 1);
                for (j1 = k1 + 1; j1 < n; j1++) {
                    s1 = 0;
                    for (i1 = k1; i1 < m; i1++) {
                        s1 += qr.get(i1, k1) * qr.get(i1, j1);
                    }
                    s1 = -s1 / qr.get(k1, k1);
                    for (i1 = k1; i1 < m; i1++) {
                        qr.set(i1, j1, qr.get(i1, j1) + s1 * qr.get(i1, k1));
                    }
                }
            }
            rdiag[k1] = -nrm;
        }
        this.QR = qr;
        this.Rdiag = rdiag;
    }

    get upperTriangularMatrix() {
        let qr1 = this.QR;
        let n1 = qr1.columns;
        let X = new Matrix(n1, n1);
        let i2, j2;
        for (i2 = 0; i2 < n1; i2++) {
            for (j2 = 0; j2 < n1; j2++) {
                if (i2 < j2) {
                    X.set(i2, j2, qr1.get(i2, j2));
                } else if (i2 === j2) {
                    X.set(i2, j2, this.Rdiag[i2]);
                } else {
                    X.set(i2, j2, 0);
                }
            }
        }
        return X;
    }

    get orthogonalMatrix() {
        let qr1 = this.QR;
        let rows3 = qr1.rows;
        let columns2 = qr1.columns;
        let X = new Matrix(rows3, columns2);
        let i2, j2, k2, s2;
        for (k2 = columns2 - 1; k2 >= 0; k2--) {
            for (i2 = 0; i2 < rows3; i2++) {
                X.set(i2, k2, 0);
            }
            X.set(k2, k2, 1);
            for (j2 = k2; j2 < columns2; j2++) {
                if (qr1.get(k2, k2) !== 0) {
                    s2 = 0;
                    for (i2 = k2; i2 < rows3; i2++) {
                        s2 += qr1.get(i2, k2) * X.get(i2, j2);
                    }
                    s2 = -s2 / qr1.get(k2, k2);
                    for (i2 = k2; i2 < rows3; i2++) {
                        X.set(i2, j2, X.get(i2, j2) + s2 * qr1.get(i2, k2));
                    }
                }
            }
        }
        return X;
    }

    solve(value) {
        value = Matrix.checkMatrix(value);
        let qr1 = this.QR;
        let m1 = qr1.rows;
        if (value.rows !== m1) {
            throw new Error("Matrix row dimensions must agree");
        }
        if (!this.isFullRank()) {
            throw new Error("Matrix is rank deficient");
        }
        let count = value.columns;
        let X = value.clone();
        let n1 = qr1.columns;
        let i2, j2, k2, s2;
        for (k2 = 0; k2 < n1; k2++) {
            for (j2 = 0; j2 < count; j2++) {
                s2 = 0;
                for (i2 = k2; i2 < m1; i2++) {
                    s2 += qr1.get(i2, k2) * X.get(i2, j2);
                }
                s2 = -s2 / qr1.get(k2, k2);
                for (i2 = k2; i2 < m1; i2++) {
                    X.set(i2, j2, X.get(i2, j2) + s2 * qr1.get(i2, k2));
                }
            }
        }
        for (k2 = n1 - 1; k2 >= 0; k2--) {
            for (j2 = 0; j2 < count; j2++) {
                X.set(k2, j2, X.get(k2, j2) / this.Rdiag[k2]);
            }
            for (i2 = 0; i2 < k2; i2++) {
                for (j2 = 0; j2 < count; j2++) {
                    X.set(i2, j2, X.get(i2, j2) - X.get(k2, j2) * qr1.get(i2, k2));
                }
            }
        }
        return X.subMatrix(0, n1 - 1, 0, count - 1);
    }

    isFullRank() {
        let columns2 = this.QR.columns;
        for (let i2 = 0; i2 < columns2; i2++) {
            if (this.Rdiag[i2] === 0) {
                return false;
            }
        }
        return true;
    }
}

class SingularValueDecomposition {
    constructor(value2, options1 = {}) {
        value2 = WrapperMatrix2D.checkMatrix(value2);
        if (value2.isEmpty()) {
            throw new Error("Matrix must be non-empty");
        }
        let m1 = value2.rows;
        let n1 = value2.columns;
        const {computeLeftSingularVectors = true, computeRightSingularVectors = true, autoTranspose = false} = options1;
        let wantu = Boolean(computeLeftSingularVectors);
        let wantv = Boolean(computeRightSingularVectors);
        let swapped = false;
        let a;
        if (m1 < n1) {
            if (!autoTranspose) {
                a = value2.clone();
                console.warn("Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose");
            } else {
                a = value2.transpose();
                m1 = a.rows;
                n1 = a.columns;
                swapped = true;
                let aux = wantu;
                wantu = wantv;
                wantv = aux;
            }
        } else {
            a = value2.clone();
        }
        let nu = Math.min(m1, n1);
        let ni = Math.min(m1 + 1, n1);
        let s2 = new Float64Array(ni);
        let U = new Matrix(m1, nu);
        let V = new Matrix(n1, n1);
        let e = new Float64Array(n1);
        let work = new Float64Array(m1);
        let si = new Float64Array(ni);
        for (let i2 = 0; i2 < ni; i2++) {
            si[i2] = i2;
        }
        let nct = Math.min(m1 - 1, n1);
        let nrt = Math.max(0, Math.min(n1 - 2, m1));
        let mrc = Math.max(nct, nrt);
        for (let k2 = 0; k2 < mrc; k2++) {
            if (k2 < nct) {
                s2[k2] = 0;
                for (let i3 = k2; i3 < m1; i3++) {
                    s2[k2] = hypotenuse(s2[k2], a.get(i3, k2));
                }
                if (s2[k2] !== 0) {
                    if (a.get(k2, k2) < 0) {
                        s2[k2] = -s2[k2];
                    }
                    for (let i4 = k2; i4 < m1; i4++) {
                        a.set(i4, k2, a.get(i4, k2) / s2[k2]);
                    }
                    a.set(k2, k2, a.get(k2, k2) + 1);
                }
                s2[k2] = -s2[k2];
            }
            for (let j2 = k2 + 1; j2 < n1; j2++) {
                if (k2 < nct && s2[k2] !== 0) {
                    let t1 = 0;
                    for (let i3 = k2; i3 < m1; i3++) {
                        t1 += a.get(i3, k2) * a.get(i3, j2);
                    }
                    t1 = -t1 / a.get(k2, k2);
                    for (let i4 = k2; i4 < m1; i4++) {
                        a.set(i4, j2, a.get(i4, j2) + t1 * a.get(i4, k2));
                    }
                }
                e[j2] = a.get(k2, j2);
            }
            if (wantu && k2 < nct) {
                for (let i3 = k2; i3 < m1; i3++) {
                    U.set(i3, k2, a.get(i3, k2));
                }
            }
            if (k2 < nrt) {
                e[k2] = 0;
                for (let i3 = k2 + 1; i3 < n1; i3++) {
                    e[k2] = hypotenuse(e[k2], e[i3]);
                }
                if (e[k2] !== 0) {
                    if (e[k2 + 1] < 0) {
                        e[k2] = 0 - e[k2];
                    }
                    for (let i4 = k2 + 1; i4 < n1; i4++) {
                        e[i4] /= e[k2];
                    }
                    e[k2 + 1] += 1;
                }
                e[k2] = -e[k2];
                if (k2 + 1 < m1 && e[k2] !== 0) {
                    for (let i4 = k2 + 1; i4 < m1; i4++) {
                        work[i4] = 0;
                    }
                    for (let i5 = k2 + 1; i5 < m1; i5++) {
                        for (let j3 = k2 + 1; j3 < n1; j3++) {
                            work[i5] += e[j3] * a.get(i5, j3);
                        }
                    }
                    for (let j3 = k2 + 1; j3 < n1; j3++) {
                        let t1 = -e[j3] / e[k2 + 1];
                        for (let i6 = k2 + 1; i6 < m1; i6++) {
                            a.set(i6, j3, a.get(i6, j3) + t1 * work[i6]);
                        }
                    }
                }
                if (wantv) {
                    for (let i4 = k2 + 1; i4 < n1; i4++) {
                        V.set(i4, k2, e[i4]);
                    }
                }
            }
        }
        let p1 = Math.min(n1, m1 + 1);
        if (nct < n1) {
            s2[nct] = a.get(nct, nct);
        }
        if (m1 < p1) {
            s2[p1 - 1] = 0;
        }
        if (nrt + 1 < p1) {
            e[nrt] = a.get(nrt, p1 - 1);
        }
        e[p1 - 1] = 0;
        if (wantu) {
            for (let j2 = nct; j2 < nu; j2++) {
                for (let i3 = 0; i3 < m1; i3++) {
                    U.set(i3, j2, 0);
                }
                U.set(j2, j2, 1);
            }
            for (let k3 = nct - 1; k3 >= 0; k3--) {
                if (s2[k3] !== 0) {
                    for (let j3 = k3 + 1; j3 < nu; j3++) {
                        let t1 = 0;
                        for (let i3 = k3; i3 < m1; i3++) {
                            t1 += U.get(i3, k3) * U.get(i3, j3);
                        }
                        t1 = -t1 / U.get(k3, k3);
                        for (let i4 = k3; i4 < m1; i4++) {
                            U.set(i4, j3, U.get(i4, j3) + t1 * U.get(i4, k3));
                        }
                    }
                    for (let i3 = k3; i3 < m1; i3++) {
                        U.set(i3, k3, -U.get(i3, k3));
                    }
                    U.set(k3, k3, 1 + U.get(k3, k3));
                    for (let i4 = 0; i4 < k3 - 1; i4++) {
                        U.set(i4, k3, 0);
                    }
                } else {
                    for (let i3 = 0; i3 < m1; i3++) {
                        U.set(i3, k3, 0);
                    }
                    U.set(k3, k3, 1);
                }
            }
        }
        if (wantv) {
            for (let k3 = n1 - 1; k3 >= 0; k3--) {
                if (k3 < nrt && e[k3] !== 0) {
                    for (let j2 = k3 + 1; j2 < n1; j2++) {
                        let t1 = 0;
                        for (let i3 = k3 + 1; i3 < n1; i3++) {
                            t1 += V.get(i3, k3) * V.get(i3, j2);
                        }
                        t1 = -t1 / V.get(k3 + 1, k3);
                        for (let i4 = k3 + 1; i4 < n1; i4++) {
                            V.set(i4, j2, V.get(i4, j2) + t1 * V.get(i4, k3));
                        }
                    }
                }
                for (let i3 = 0; i3 < n1; i3++) {
                    V.set(i3, k3, 0);
                }
                V.set(k3, k3, 1);
            }
        }
        let pp = p1 - 1;
        let eps = Number.EPSILON;
        while (p1 > 0) {
            let k3, kase;
            for (k3 = p1 - 2; k3 >= -1; k3--) {
                if (k3 === -1) {
                    break;
                }
                const alpha = Number.MIN_VALUE + eps * Math.abs(s2[k3] + Math.abs(s2[k3 + 1]));
                if (Math.abs(e[k3]) <= alpha || Number.isNaN(e[k3])) {
                    e[k3] = 0;
                    break;
                }
            }
            if (k3 === p1 - 2) {
                kase = 4;
            } else {
                let ks;
                for (ks = p1 - 1; ks >= k3; ks--) {
                    if (ks === k3) {
                        break;
                    }
                    let t1 = (ks !== p1 ? Math.abs(e[ks]) : 0) + (ks !== k3 + 1 ? Math.abs(e[ks - 1]) : 0);
                    if (Math.abs(s2[ks]) <= eps * t1) {
                        s2[ks] = 0;
                        break;
                    }
                }
                if (ks === k3) {
                    kase = 3;
                } else if (ks === p1 - 1) {
                    kase = 1;
                } else {
                    kase = 2;
                    k3 = ks;
                }
            }
            k3++;
            switch (kase) {
                case 1: {
                    let f = e[p1 - 2];
                    e[p1 - 2] = 0;
                    for (let j2 = p1 - 2; j2 >= k3; j2--) {
                        let t1 = hypotenuse(s2[j2], f);
                        let cs = s2[j2] / t1;
                        let sn = f / t1;
                        s2[j2] = t1;
                        if (j2 !== k3) {
                            f = -sn * e[j2 - 1];
                            e[j2 - 1] = cs * e[j2 - 1];
                        }
                        if (wantv) {
                            for (let i3 = 0; i3 < n1; i3++) {
                                t1 = cs * V.get(i3, j2) + sn * V.get(i3, p1 - 1);
                                V.set(i3, p1 - 1, -sn * V.get(i3, j2) + cs * V.get(i3, p1 - 1));
                                V.set(i3, j2, t1);
                            }
                        }
                    }
                    break;
                }
                case 2: {
                    let f = e[k3 - 1];
                    e[k3 - 1] = 0;
                    for (let j2 = k3; j2 < p1; j2++) {
                        let t1 = hypotenuse(s2[j2], f);
                        let cs = s2[j2] / t1;
                        let sn = f / t1;
                        s2[j2] = t1;
                        f = -sn * e[j2];
                        e[j2] = cs * e[j2];
                        if (wantu) {
                            for (let i3 = 0; i3 < m1; i3++) {
                                t1 = cs * U.get(i3, j2) + sn * U.get(i3, k3 - 1);
                                U.set(i3, k3 - 1, -sn * U.get(i3, j2) + cs * U.get(i3, k3 - 1));
                                U.set(i3, j2, t1);
                            }
                        }
                    }
                    break;
                }
                case 3: {
                    const scale = Math.max(Math.abs(s2[p1 - 1]), Math.abs(s2[p1 - 2]), Math.abs(e[p1 - 2]), Math.abs(s2[k3]), Math.abs(e[k3]));
                    const sp = s2[p1 - 1] / scale;
                    const spm1 = s2[p1 - 2] / scale;
                    const epm1 = e[p1 - 2] / scale;
                    const sk = s2[k3] / scale;
                    const ek = e[k3] / scale;
                    const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
                    const c = sp * epm1 * (sp * epm1);
                    let shift = 0;
                    if (b !== 0 || c !== 0) {
                        if (b < 0) {
                            shift = 0 - Math.sqrt(b * b + c);
                        } else {
                            shift = Math.sqrt(b * b + c);
                        }
                        shift = c / (b + shift);
                    }
                    let f = (sk + sp) * (sk - sp) + shift;
                    let g = sk * ek;
                    for (let j2 = k3; j2 < p1 - 1; j2++) {
                        let t1 = hypotenuse(f, g);
                        if (t1 === 0) {
                            t1 = Number.MIN_VALUE;
                        }
                        let cs = f / t1;
                        let sn = g / t1;
                        if (j2 !== k3) {
                            e[j2 - 1] = t1;
                        }
                        f = cs * s2[j2] + sn * e[j2];
                        e[j2] = cs * e[j2] - sn * s2[j2];
                        g = sn * s2[j2 + 1];
                        s2[j2 + 1] = cs * s2[j2 + 1];
                        if (wantv) {
                            for (let i3 = 0; i3 < n1; i3++) {
                                t1 = cs * V.get(i3, j2) + sn * V.get(i3, j2 + 1);
                                V.set(i3, j2 + 1, -sn * V.get(i3, j2) + cs * V.get(i3, j2 + 1));
                                V.set(i3, j2, t1);
                            }
                        }
                        t1 = hypotenuse(f, g);
                        if (t1 === 0) {
                            t1 = Number.MIN_VALUE;
                        }
                        cs = f / t1;
                        sn = g / t1;
                        s2[j2] = t1;
                        f = cs * e[j2] + sn * s2[j2 + 1];
                        s2[j2 + 1] = -sn * e[j2] + cs * s2[j2 + 1];
                        g = sn * e[j2 + 1];
                        e[j2 + 1] = cs * e[j2 + 1];
                        if (wantu && j2 < m1 - 1) {
                            for (let i3 = 0; i3 < m1; i3++) {
                                t1 = cs * U.get(i3, j2) + sn * U.get(i3, j2 + 1);
                                U.set(i3, j2 + 1, -sn * U.get(i3, j2) + cs * U.get(i3, j2 + 1));
                                U.set(i3, j2, t1);
                            }
                        }
                    }
                    e[p1 - 2] = f;
                    break;
                }
                case 4: {
                    if (s2[k3] <= 0) {
                        s2[k3] = s2[k3] < 0 ? -s2[k3] : 0;
                        if (wantv) {
                            for (let i3 = 0; i3 <= pp; i3++) {
                                V.set(i3, k3, -V.get(i3, k3));
                            }
                        }
                    }
                    while (k3 < pp) {
                        if (s2[k3] >= s2[k3 + 1]) {
                            break;
                        }
                        let t1 = s2[k3];
                        s2[k3] = s2[k3 + 1];
                        s2[k3 + 1] = t1;
                        if (wantv && k3 < n1 - 1) {
                            for (let i3 = 0; i3 < n1; i3++) {
                                t1 = V.get(i3, k3 + 1);
                                V.set(i3, k3 + 1, V.get(i3, k3));
                                V.set(i3, k3, t1);
                            }
                        }
                        if (wantu && k3 < m1 - 1) {
                            for (let i3 = 0; i3 < m1; i3++) {
                                t1 = U.get(i3, k3 + 1);
                                U.set(i3, k3 + 1, U.get(i3, k3));
                                U.set(i3, k3, t1);
                            }
                        }
                        k3++;
                    }
                    p1--;
                    break;
                }
            }
        }
        if (swapped) {
            let tmp = V;
            V = U;
            U = tmp;
        }
        this.m = m1;
        this.n = n1;
        this.s = s2;
        this.U = U;
        this.V = V;
    }

    get condition() {
        return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
    }

    get norm2() {
        return this.s[0];
    }

    get rank() {
        let tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
        let r = 0;
        let s3 = this.s;
        for (let i3 = 0, ii = s3.length; i3 < ii; i3++) {
            if (s3[i3] > tol) {
                r++;
            }
        }
        return r;
    }

    get diagonal() {
        return Array.from(this.s);
    }

    get threshold() {
        return Number.EPSILON / 2 * Math.max(this.m, this.n) * this.s[0];
    }

    get leftSingularVectors() {
        return this.U;
    }

    get rightSingularVectors() {
        return this.V;
    }

    get diagonalMatrix() {
        return Matrix.diag(this.s);
    }

    solve(value) {
        let Y = value;
        let e1 = this.threshold;
        let scols = this.s.length;
        let Ls = Matrix.zeros(scols, scols);
        for (let i3 = 0; i3 < scols; i3++) {
            if (Math.abs(this.s[i3]) <= e1) {
                Ls.set(i3, i3, 0);
            } else {
                Ls.set(i3, i3, 1 / this.s[i3]);
            }
        }
        let U1 = this.U;
        let V1 = this.rightSingularVectors;
        let VL = V1.mmul(Ls);
        let vrows = V1.rows;
        let urows = U1.rows;
        let VLU = Matrix.zeros(vrows, urows);
        for (let i4 = 0; i4 < vrows; i4++) {
            for (let j2 = 0; j2 < urows; j2++) {
                let sum = 0;
                for (let k3 = 0; k3 < scols; k3++) {
                    sum += VL.get(i4, k3) * U1.get(j2, k3);
                }
                VLU.set(i4, j2, sum);
            }
        }
        return VLU.mmul(Y);
    }

    solveForDiagonal(value) {
        return this.solve(Matrix.diag(value));
    }

    inverse() {
        let V1 = this.V;
        let e1 = this.threshold;
        let vrows = V1.rows;
        let vcols = V1.columns;
        let X = new Matrix(vrows, this.s.length);
        for (let i3 = 0; i3 < vrows; i3++) {
            for (let j2 = 0; j2 < vcols; j2++) {
                if (Math.abs(this.s[j2]) > e1) {
                    X.set(i3, j2, V1.get(i3, j2) / this.s[j2]);
                }
            }
        }
        let U1 = this.U;
        let urows = U1.rows;
        let ucols = U1.columns;
        let Y = new Matrix(vrows, urows);
        for (let i4 = 0; i4 < vrows; i4++) {
            for (let j2 = 0; j2 < urows; j2++) {
                let sum = 0;
                for (let k3 = 0; k3 < ucols; k3++) {
                    sum += X.get(i4, k3) * U1.get(j2, k3);
                }
                Y.set(i4, j2, sum);
            }
        }
        return Y;
    }
}

function pseudoInverse(matrix11, threshold = Number.EPSILON) {
    matrix11 = Matrix.checkMatrix(matrix11);
    if (matrix11.isEmpty()) {
        return matrix11.transpose();
    }
    let svdSolution = new SingularValueDecomposition(matrix11, {
        autoTranspose: true
    });
    let U1 = svdSolution.leftSingularVectors;
    let V1 = svdSolution.rightSingularVectors;
    let s3 = svdSolution.diagonal;
    for (let i3 = 0; i3 < s3.length; i3++) {
        if (Math.abs(s3[i3]) > threshold) {
            s3[i3] = 1 / s3[i3];
        } else {
            s3[i3] = 0;
        }
    }
    return V1.mmul(Matrix.diag(s3).mmul(U1.transpose()));
}

class EigenvalueDecomposition {
    constructor(matrix11, options2 = {}) {
        const {assumeSymmetric = false} = options2;
        matrix11 = WrapperMatrix2D.checkMatrix(matrix11);
        if (!matrix11.isSquare()) {
            throw new Error("Matrix is not a square matrix");
        }
        if (matrix11.isEmpty()) {
            throw new Error("Matrix must be non-empty");
        }
        let n2 = matrix11.columns;
        let V1 = new Matrix(n2, n2);
        let d = new Float64Array(n2);
        let e1 = new Float64Array(n2);
        let value3 = matrix11;
        let i3, j2;
        let isSymmetric = false;
        if (assumeSymmetric) {
            isSymmetric = true;
        } else {
            isSymmetric = matrix11.isSymmetric();
        }
        if (isSymmetric) {
            for (i3 = 0; i3 < n2; i3++) {
                for (j2 = 0; j2 < n2; j2++) {
                    V1.set(i3, j2, value3.get(i3, j2));
                }
            }
            tred2(n2, e1, d, V1);
            tql2(n2, e1, d, V1);
        } else {
            let H = new Matrix(n2, n2);
            let ort = new Float64Array(n2);
            for (j2 = 0; j2 < n2; j2++) {
                for (i3 = 0; i3 < n2; i3++) {
                    H.set(i3, j2, value3.get(i3, j2));
                }
            }
            orthes(n2, H, ort, V1);
            hqr2(n2, e1, d, V1, H);
        }
        this.n = n2;
        this.e = e1;
        this.d = d;
        this.V = V1;
    }

    get realEigenvalues() {
        return Array.from(this.d);
    }

    get imaginaryEigenvalues() {
        return Array.from(this.e);
    }

    get eigenvectorMatrix() {
        return this.V;
    }

    get diagonalMatrix() {
        let n3 = this.n;
        let e2 = this.e;
        let d1 = this.d;
        let X = new Matrix(n3, n3);
        let i4, j3;
        for (i4 = 0; i4 < n3; i4++) {
            for (j3 = 0; j3 < n3; j3++) {
                X.set(i4, j3, 0);
            }
            X.set(i4, i4, d1[i4]);
            if (e2[i4] > 0) {
                X.set(i4, i4 + 1, e2[i4]);
            } else if (e2[i4] < 0) {
                X.set(i4, i4 - 1, e2[i4]);
            }
        }
        return X;
    }
}

function tred2(n3, e2, d1, V2) {
    let f, g, h, i4, j3, k3, hh, scale;
    for (j3 = 0; j3 < n3; j3++) {
        d1[j3] = V2.get(n3 - 1, j3);
    }
    for (i4 = n3 - 1; i4 > 0; i4--) {
        scale = 0;
        h = 0;
        for (k3 = 0; k3 < i4; k3++) {
            scale = scale + Math.abs(d1[k3]);
        }
        if (scale === 0) {
            e2[i4] = d1[i4 - 1];
            for (j3 = 0; j3 < i4; j3++) {
                d1[j3] = V2.get(i4 - 1, j3);
                V2.set(i4, j3, 0);
                V2.set(j3, i4, 0);
            }
        } else {
            for (k3 = 0; k3 < i4; k3++) {
                d1[k3] /= scale;
                h += d1[k3] * d1[k3];
            }
            f = d1[i4 - 1];
            g = Math.sqrt(h);
            if (f > 0) {
                g = -g;
            }
            e2[i4] = scale * g;
            h = h - f * g;
            d1[i4 - 1] = f - g;
            for (j3 = 0; j3 < i4; j3++) {
                e2[j3] = 0;
            }
            for (j3 = 0; j3 < i4; j3++) {
                f = d1[j3];
                V2.set(j3, i4, f);
                g = e2[j3] + V2.get(j3, j3) * f;
                for (k3 = j3 + 1; k3 <= i4 - 1; k3++) {
                    g += V2.get(k3, j3) * d1[k3];
                    e2[k3] += V2.get(k3, j3) * f;
                }
                e2[j3] = g;
            }
            f = 0;
            for (j3 = 0; j3 < i4; j3++) {
                e2[j3] /= h;
                f += e2[j3] * d1[j3];
            }
            hh = f / (h + h);
            for (j3 = 0; j3 < i4; j3++) {
                e2[j3] -= hh * d1[j3];
            }
            for (j3 = 0; j3 < i4; j3++) {
                f = d1[j3];
                g = e2[j3];
                for (k3 = j3; k3 <= i4 - 1; k3++) {
                    V2.set(k3, j3, V2.get(k3, j3) - (f * e2[k3] + g * d1[k3]));
                }
                d1[j3] = V2.get(i4 - 1, j3);
                V2.set(i4, j3, 0);
            }
        }
        d1[i4] = h;
    }
    for (i4 = 0; i4 < n3 - 1; i4++) {
        V2.set(n3 - 1, i4, V2.get(i4, i4));
        V2.set(i4, i4, 1);
        h = d1[i4 + 1];
        if (h !== 0) {
            for (k3 = 0; k3 <= i4; k3++) {
                d1[k3] = V2.get(k3, i4 + 1) / h;
            }
            for (j3 = 0; j3 <= i4; j3++) {
                g = 0;
                for (k3 = 0; k3 <= i4; k3++) {
                    g += V2.get(k3, i4 + 1) * V2.get(k3, j3);
                }
                for (k3 = 0; k3 <= i4; k3++) {
                    V2.set(k3, j3, V2.get(k3, j3) - g * d1[k3]);
                }
            }
        }
        for (k3 = 0; k3 <= i4; k3++) {
            V2.set(k3, i4 + 1, 0);
        }
    }
    for (j3 = 0; j3 < n3; j3++) {
        d1[j3] = V2.get(n3 - 1, j3);
        V2.set(n3 - 1, j3, 0);
    }
    V2.set(n3 - 1, n3 - 1, 1);
    e2[0] = 0;
}

function tql2(n3, e2, d1, V2) {
    let g, h, i4, j3, k3, l, m2, p2, r, dl1, c, c2, c3, el1, s3, s21;
    for (i4 = 1; i4 < n3; i4++) {
        e2[i4 - 1] = e2[i4];
    }
    e2[n3 - 1] = 0;
    let f = 0;
    let tst1 = 0;
    let eps1 = Number.EPSILON;
    for (l = 0; l < n3; l++) {
        tst1 = Math.max(tst1, Math.abs(d1[l]) + Math.abs(e2[l]));
        m2 = l;
        while (m2 < n3) {
            if (Math.abs(e2[m2]) <= eps1 * tst1) {
                break;
            }
            m2++;
        }
        if (m2 > l) {
            do {
                g = d1[l];
                p2 = (d1[l + 1] - g) / (2 * e2[l]);
                r = hypotenuse(p2, 1);
                if (p2 < 0) {
                    r = -r;
                }
                d1[l] = e2[l] / (p2 + r);
                d1[l + 1] = e2[l] * (p2 + r);
                dl1 = d1[l + 1];
                h = g - d1[l];
                for (i4 = l + 2; i4 < n3; i4++) {
                    d1[i4] -= h;
                }
                f = f + h;
                p2 = d1[m2];
                c = 1;
                c2 = c;
                c3 = c;
                el1 = e2[l + 1];
                s3 = 0;
                s21 = 0;
                for (i4 = m2 - 1; i4 >= l; i4--) {
                    c3 = c2;
                    c2 = c;
                    s21 = s3;
                    g = c * e2[i4];
                    h = c * p2;
                    r = hypotenuse(p2, e2[i4]);
                    e2[i4 + 1] = s3 * r;
                    s3 = e2[i4] / r;
                    c = p2 / r;
                    p2 = c * d1[i4] - s3 * g;
                    d1[i4 + 1] = h + s3 * (c * g + s3 * d1[i4]);
                    for (k3 = 0; k3 < n3; k3++) {
                        h = V2.get(k3, i4 + 1);
                        V2.set(k3, i4 + 1, s3 * V2.get(k3, i4) + c * h);
                        V2.set(k3, i4, c * V2.get(k3, i4) - s3 * h);
                    }
                }
                p2 = -s3 * s21 * c3 * el1 * e2[l] / dl1;
                e2[l] = s3 * p2;
                d1[l] = c * p2;
            } while (Math.abs(e2[l]) > eps1 * tst1)
        }
        d1[l] = d1[l] + f;
        e2[l] = 0;
    }
    for (i4 = 0; i4 < n3 - 1; i4++) {
        k3 = i4;
        p2 = d1[i4];
        for (j3 = i4 + 1; j3 < n3; j3++) {
            if (d1[j3] < p2) {
                k3 = j3;
                p2 = d1[j3];
            }
        }
        if (k3 !== i4) {
            d1[k3] = d1[i4];
            d1[i4] = p2;
            for (j3 = 0; j3 < n3; j3++) {
                p2 = V2.get(j3, i4);
                V2.set(j3, i4, V2.get(j3, k3));
                V2.set(j3, k3, p2);
            }
        }
    }
}

function orthes(n3, H, ort, V2) {
    let low = 0;
    let high = n3 - 1;
    let f, g, h, i4, j3, m2;
    let scale;
    for (m2 = low + 1; m2 <= high - 1; m2++) {
        scale = 0;
        for (i4 = m2; i4 <= high; i4++) {
            scale = scale + Math.abs(H.get(i4, m2 - 1));
        }
        if (scale !== 0) {
            h = 0;
            for (i4 = high; i4 >= m2; i4--) {
                ort[i4] = H.get(i4, m2 - 1) / scale;
                h += ort[i4] * ort[i4];
            }
            g = Math.sqrt(h);
            if (ort[m2] > 0) {
                g = -g;
            }
            h = h - ort[m2] * g;
            ort[m2] = ort[m2] - g;
            for (j3 = m2; j3 < n3; j3++) {
                f = 0;
                for (i4 = high; i4 >= m2; i4--) {
                    f += ort[i4] * H.get(i4, j3);
                }
                f = f / h;
                for (i4 = m2; i4 <= high; i4++) {
                    H.set(i4, j3, H.get(i4, j3) - f * ort[i4]);
                }
            }
            for (i4 = 0; i4 <= high; i4++) {
                f = 0;
                for (j3 = high; j3 >= m2; j3--) {
                    f += ort[j3] * H.get(i4, j3);
                }
                f = f / h;
                for (j3 = m2; j3 <= high; j3++) {
                    H.set(i4, j3, H.get(i4, j3) - f * ort[j3]);
                }
            }
            ort[m2] = scale * ort[m2];
            H.set(m2, m2 - 1, scale * g);
        }
    }
    for (i4 = 0; i4 < n3; i4++) {
        for (j3 = 0; j3 < n3; j3++) {
            V2.set(i4, j3, i4 === j3 ? 1 : 0);
        }
    }
    for (m2 = high - 1; m2 >= low + 1; m2--) {
        if (H.get(m2, m2 - 1) !== 0) {
            for (i4 = m2 + 1; i4 <= high; i4++) {
                ort[i4] = H.get(i4, m2 - 1);
            }
            for (j3 = m2; j3 <= high; j3++) {
                g = 0;
                for (i4 = m2; i4 <= high; i4++) {
                    g += ort[i4] * V2.get(i4, j3);
                }
                g = g / ort[m2] / H.get(m2, m2 - 1);
                for (i4 = m2; i4 <= high; i4++) {
                    V2.set(i4, j3, V2.get(i4, j3) + g * ort[i4]);
                }
            }
        }
    }
}

function hqr2(nn, e2, d1, V2, H) {
    let n3 = nn - 1;
    let low = 0;
    let high = nn - 1;
    let eps1 = Number.EPSILON;
    let exshift = 0;
    let norm = 0;
    let p2 = 0;
    let q = 0;
    let r = 0;
    let s3 = 0;
    let z = 0;
    let iter = 0;
    let i4, j3, k3, l, m2, t1, w, x, y;
    let ra, sa, vr, vi;
    let notlast, cdivres;
    for (i4 = 0; i4 < nn; i4++) {
        if (i4 < low || i4 > high) {
            d1[i4] = H.get(i4, i4);
            e2[i4] = 0;
        }
        for (j3 = Math.max(i4 - 1, 0); j3 < nn; j3++) {
            norm = norm + Math.abs(H.get(i4, j3));
        }
    }
    while (n3 >= low) {
        l = n3;
        while (l > low) {
            s3 = Math.abs(H.get(l - 1, l - 1)) + Math.abs(H.get(l, l));
            if (s3 === 0) {
                s3 = norm;
            }
            if (Math.abs(H.get(l, l - 1)) < eps1 * s3) {
                break;
            }
            l--;
        }
        if (l === n3) {
            H.set(n3, n3, H.get(n3, n3) + exshift);
            d1[n3] = H.get(n3, n3);
            e2[n3] = 0;
            n3--;
            iter = 0;
        } else if (l === n3 - 1) {
            w = H.get(n3, n3 - 1) * H.get(n3 - 1, n3);
            p2 = (H.get(n3 - 1, n3 - 1) - H.get(n3, n3)) / 2;
            q = p2 * p2 + w;
            z = Math.sqrt(Math.abs(q));
            H.set(n3, n3, H.get(n3, n3) + exshift);
            H.set(n3 - 1, n3 - 1, H.get(n3 - 1, n3 - 1) + exshift);
            x = H.get(n3, n3);
            if (q >= 0) {
                z = p2 >= 0 ? p2 + z : p2 - z;
                d1[n3 - 1] = x + z;
                d1[n3] = d1[n3 - 1];
                if (z !== 0) {
                    d1[n3] = x - w / z;
                }
                e2[n3 - 1] = 0;
                e2[n3] = 0;
                x = H.get(n3, n3 - 1);
                s3 = Math.abs(x) + Math.abs(z);
                p2 = x / s3;
                q = z / s3;
                r = Math.sqrt(p2 * p2 + q * q);
                p2 = p2 / r;
                q = q / r;
                for (j3 = n3 - 1; j3 < nn; j3++) {
                    z = H.get(n3 - 1, j3);
                    H.set(n3 - 1, j3, q * z + p2 * H.get(n3, j3));
                    H.set(n3, j3, q * H.get(n3, j3) - p2 * z);
                }
                for (i4 = 0; i4 <= n3; i4++) {
                    z = H.get(i4, n3 - 1);
                    H.set(i4, n3 - 1, q * z + p2 * H.get(i4, n3));
                    H.set(i4, n3, q * H.get(i4, n3) - p2 * z);
                }
                for (i4 = low; i4 <= high; i4++) {
                    z = V2.get(i4, n3 - 1);
                    V2.set(i4, n3 - 1, q * z + p2 * V2.get(i4, n3));
                    V2.set(i4, n3, q * V2.get(i4, n3) - p2 * z);
                }
            } else {
                d1[n3 - 1] = x + p2;
                d1[n3] = x + p2;
                e2[n3 - 1] = z;
                e2[n3] = -z;
            }
            n3 = n3 - 2;
            iter = 0;
        } else {
            x = H.get(n3, n3);
            y = 0;
            w = 0;
            if (l < n3) {
                y = H.get(n3 - 1, n3 - 1);
                w = H.get(n3, n3 - 1) * H.get(n3 - 1, n3);
            }
            if (iter === 10) {
                exshift += x;
                for (i4 = low; i4 <= n3; i4++) {
                    H.set(i4, i4, H.get(i4, i4) - x);
                }
                s3 = Math.abs(H.get(n3, n3 - 1)) + Math.abs(H.get(n3 - 1, n3 - 2));
                x = y = 0.75 * s3;
                w = -0.4375 * s3 * s3;
            }
            if (iter === 30) {
                s3 = (y - x) / 2;
                s3 = s3 * s3 + w;
                if (s3 > 0) {
                    s3 = Math.sqrt(s3);
                    if (y < x) {
                        s3 = -s3;
                    }
                    s3 = x - w / ((y - x) / 2 + s3);
                    for (i4 = low; i4 <= n3; i4++) {
                        H.set(i4, i4, H.get(i4, i4) - s3);
                    }
                    exshift += s3;
                    x = y = w = 0.964;
                }
            }
            iter = iter + 1;
            m2 = n3 - 2;
            while (m2 >= l) {
                z = H.get(m2, m2);
                r = x - z;
                s3 = y - z;
                p2 = (r * s3 - w) / H.get(m2 + 1, m2) + H.get(m2, m2 + 1);
                q = H.get(m2 + 1, m2 + 1) - z - r - s3;
                r = H.get(m2 + 2, m2 + 1);
                s3 = Math.abs(p2) + Math.abs(q) + Math.abs(r);
                p2 = p2 / s3;
                q = q / s3;
                r = r / s3;
                if (m2 === l) {
                    break;
                }
                if (Math.abs(H.get(m2, m2 - 1)) * (Math.abs(q) + Math.abs(r)) < eps1 * (Math.abs(p2) * (Math.abs(H.get(m2 - 1, m2 - 1)) + Math.abs(z) + Math.abs(H.get(m2 + 1, m2 + 1))))) {
                    break;
                }
                m2--;
            }
            for (i4 = m2 + 2; i4 <= n3; i4++) {
                H.set(i4, i4 - 2, 0);
                if (i4 > m2 + 2) {
                    H.set(i4, i4 - 3, 0);
                }
            }
            for (k3 = m2; k3 <= n3 - 1; k3++) {
                notlast = k3 !== n3 - 1;
                if (k3 !== m2) {
                    p2 = H.get(k3, k3 - 1);
                    q = H.get(k3 + 1, k3 - 1);
                    r = notlast ? H.get(k3 + 2, k3 - 1) : 0;
                    x = Math.abs(p2) + Math.abs(q) + Math.abs(r);
                    if (x !== 0) {
                        p2 = p2 / x;
                        q = q / x;
                        r = r / x;
                    }
                }
                if (x === 0) {
                    break;
                }
                s3 = Math.sqrt(p2 * p2 + q * q + r * r);
                if (p2 < 0) {
                    s3 = -s3;
                }
                if (s3 !== 0) {
                    if (k3 !== m2) {
                        H.set(k3, k3 - 1, -s3 * x);
                    } else if (l !== m2) {
                        H.set(k3, k3 - 1, -H.get(k3, k3 - 1));
                    }
                    p2 = p2 + s3;
                    x = p2 / s3;
                    y = q / s3;
                    z = r / s3;
                    q = q / p2;
                    r = r / p2;
                    for (j3 = k3; j3 < nn; j3++) {
                        p2 = H.get(k3, j3) + q * H.get(k3 + 1, j3);
                        if (notlast) {
                            p2 = p2 + r * H.get(k3 + 2, j3);
                            H.set(k3 + 2, j3, H.get(k3 + 2, j3) - p2 * z);
                        }
                        H.set(k3, j3, H.get(k3, j3) - p2 * x);
                        H.set(k3 + 1, j3, H.get(k3 + 1, j3) - p2 * y);
                    }
                    for (i4 = 0; i4 <= Math.min(n3, k3 + 3); i4++) {
                        p2 = x * H.get(i4, k3) + y * H.get(i4, k3 + 1);
                        if (notlast) {
                            p2 = p2 + z * H.get(i4, k3 + 2);
                            H.set(i4, k3 + 2, H.get(i4, k3 + 2) - p2 * r);
                        }
                        H.set(i4, k3, H.get(i4, k3) - p2);
                        H.set(i4, k3 + 1, H.get(i4, k3 + 1) - p2 * q);
                    }
                    for (i4 = low; i4 <= high; i4++) {
                        p2 = x * V2.get(i4, k3) + y * V2.get(i4, k3 + 1);
                        if (notlast) {
                            p2 = p2 + z * V2.get(i4, k3 + 2);
                            V2.set(i4, k3 + 2, V2.get(i4, k3 + 2) - p2 * r);
                        }
                        V2.set(i4, k3, V2.get(i4, k3) - p2);
                        V2.set(i4, k3 + 1, V2.get(i4, k3 + 1) - p2 * q);
                    }
                }
            }
        }
    }
    if (norm === 0) {
        return;
    }
    for (n3 = nn - 1; n3 >= 0; n3--) {
        p2 = d1[n3];
        q = e2[n3];
        if (q === 0) {
            l = n3;
            H.set(n3, n3, 1);
            for (i4 = n3 - 1; i4 >= 0; i4--) {
                w = H.get(i4, i4) - p2;
                r = 0;
                for (j3 = l; j3 <= n3; j3++) {
                    r = r + H.get(i4, j3) * H.get(j3, n3);
                }
                if (e2[i4] < 0) {
                    z = w;
                    s3 = r;
                } else {
                    l = i4;
                    if (e2[i4] === 0) {
                        H.set(i4, n3, w !== 0 ? -r / w : -r / (eps1 * norm));
                    } else {
                        x = H.get(i4, i4 + 1);
                        y = H.get(i4 + 1, i4);
                        q = (d1[i4] - p2) * (d1[i4] - p2) + e2[i4] * e2[i4];
                        t1 = (x * s3 - z * r) / q;
                        H.set(i4, n3, t1);
                        H.set(i4 + 1, n3, Math.abs(x) > Math.abs(z) ? (-r - w * t1) / x : (-s3 - y * t1) / z);
                    }
                    t1 = Math.abs(H.get(i4, n3));
                    if (eps1 * t1 * t1 > 1) {
                        for (j3 = i4; j3 <= n3; j3++) {
                            H.set(j3, n3, H.get(j3, n3) / t1);
                        }
                    }
                }
            }
        } else if (q < 0) {
            l = n3 - 1;
            if (Math.abs(H.get(n3, n3 - 1)) > Math.abs(H.get(n3 - 1, n3))) {
                H.set(n3 - 1, n3 - 1, q / H.get(n3, n3 - 1));
                H.set(n3 - 1, n3, -(H.get(n3, n3) - p2) / H.get(n3, n3 - 1));
            } else {
                cdivres = cdiv(0, -H.get(n3 - 1, n3), H.get(n3 - 1, n3 - 1) - p2, q);
                H.set(n3 - 1, n3 - 1, cdivres[0]);
                H.set(n3 - 1, n3, cdivres[1]);
            }
            H.set(n3, n3 - 1, 0);
            H.set(n3, n3, 1);
            for (i4 = n3 - 2; i4 >= 0; i4--) {
                ra = 0;
                sa = 0;
                for (j3 = l; j3 <= n3; j3++) {
                    ra = ra + H.get(i4, j3) * H.get(j3, n3 - 1);
                    sa = sa + H.get(i4, j3) * H.get(j3, n3);
                }
                w = H.get(i4, i4) - p2;
                if (e2[i4] < 0) {
                    z = w;
                    r = ra;
                    s3 = sa;
                } else {
                    l = i4;
                    if (e2[i4] === 0) {
                        cdivres = cdiv(-ra, -sa, w, q);
                        H.set(i4, n3 - 1, cdivres[0]);
                        H.set(i4, n3, cdivres[1]);
                    } else {
                        x = H.get(i4, i4 + 1);
                        y = H.get(i4 + 1, i4);
                        vr = (d1[i4] - p2) * (d1[i4] - p2) + e2[i4] * e2[i4] - q * q;
                        vi = (d1[i4] - p2) * 2 * q;
                        if (vr === 0 && vi === 0) {
                            vr = eps1 * norm * (Math.abs(w) + Math.abs(q) + Math.abs(x) + Math.abs(y) + Math.abs(z));
                        }
                        cdivres = cdiv(x * r - z * ra + q * sa, x * s3 - z * sa - q * ra, vr, vi);
                        H.set(i4, n3 - 1, cdivres[0]);
                        H.set(i4, n3, cdivres[1]);
                        if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
                            H.set(i4 + 1, n3 - 1, (-ra - w * H.get(i4, n3 - 1) + q * H.get(i4, n3)) / x);
                            H.set(i4 + 1, n3, (-sa - w * H.get(i4, n3) - q * H.get(i4, n3 - 1)) / x);
                        } else {
                            cdivres = cdiv(-r - y * H.get(i4, n3 - 1), -s3 - y * H.get(i4, n3), z, q);
                            H.set(i4 + 1, n3 - 1, cdivres[0]);
                            H.set(i4 + 1, n3, cdivres[1]);
                        }
                    }
                    t1 = Math.max(Math.abs(H.get(i4, n3 - 1)), Math.abs(H.get(i4, n3)));
                    if (eps1 * t1 * t1 > 1) {
                        for (j3 = i4; j3 <= n3; j3++) {
                            H.set(j3, n3 - 1, H.get(j3, n3 - 1) / t1);
                            H.set(j3, n3, H.get(j3, n3) / t1);
                        }
                    }
                }
            }
        }
    }
    for (i4 = 0; i4 < nn; i4++) {
        if (i4 < low || i4 > high) {
            for (j3 = i4; j3 < nn; j3++) {
                V2.set(i4, j3, H.get(i4, j3));
            }
        }
    }
    for (j3 = nn - 1; j3 >= low; j3--) {
        for (i4 = low; i4 <= high; i4++) {
            z = 0;
            for (k3 = low; k3 <= Math.min(j3, high); k3++) {
                z = z + V2.get(i4, k3) * H.get(k3, j3);
            }
            V2.set(i4, j3, z);
        }
    }
}

function cdiv(xr, xi, yr, yi) {
    let r, d1;
    if (Math.abs(yr) > Math.abs(yi)) {
        r = yi / yr;
        d1 = yr + r * yi;
        return [
            (xr + r * xi) / d1,
            (xi - r * xr) / d1
        ];
    } else {
        r = yr / yi;
        d1 = yi + r * yr;
        return [
            (r * xr + xi) / d1,
            (r * xi - xr) / d1
        ];
    }
}

class CholeskyDecomposition {
    constructor(value4) {
        value4 = WrapperMatrix2D.checkMatrix(value4);
        if (!value4.isSymmetric()) {
            throw new Error("Matrix is not symmetric");
        }
        let a1 = value4;
        let dimension = a1.rows;
        let l = new Matrix(dimension, dimension);
        let positiveDefinite = true;
        let i4, j3, k3;
        for (j3 = 0; j3 < dimension; j3++) {
            let d1 = 0;
            for (k3 = 0; k3 < j3; k3++) {
                let s3 = 0;
                for (i4 = 0; i4 < k3; i4++) {
                    s3 += l.get(k3, i4) * l.get(j3, i4);
                }
                s3 = (a1.get(j3, k3) - s3) / l.get(k3, k3);
                l.set(j3, k3, s3);
                d1 = d1 + s3 * s3;
            }
            d1 = a1.get(j3, j3) - d1;
            positiveDefinite &= d1 > 0;
            l.set(j3, j3, Math.sqrt(Math.max(d1, 0)));
            for (k3 = j3 + 1; k3 < dimension; k3++) {
                l.set(j3, k3, 0);
            }
        }
        this.L = l;
        this.positiveDefinite = Boolean(positiveDefinite);
    }

    get lowerTriangularMatrix() {
        return this.L;
    }

    isPositiveDefinite() {
        return this.positiveDefinite;
    }

    solve(value) {
        value = WrapperMatrix2D.checkMatrix(value);
        let l1 = this.L;
        let dimension1 = l1.rows;
        if (value.rows !== dimension1) {
            throw new Error("Matrix dimensions do not match");
        }
        if (this.isPositiveDefinite() === false) {
            throw new Error("Matrix is not positive definite");
        }
        let count = value.columns;
        let B = value.clone();
        let i5, j4, k4;
        for (k4 = 0; k4 < dimension1; k4++) {
            for (j4 = 0; j4 < count; j4++) {
                for (i5 = 0; i5 < k4; i5++) {
                    B.set(k4, j4, B.get(k4, j4) - B.get(i5, j4) * l1.get(k4, i5));
                }
                B.set(k4, j4, B.get(k4, j4) / l1.get(k4, k4));
            }
        }
        for (k4 = dimension1 - 1; k4 >= 0; k4--) {
            for (j4 = 0; j4 < count; j4++) {
                for (i5 = k4 + 1; i5 < dimension1; i5++) {
                    B.set(k4, j4, B.get(k4, j4) - B.get(i5, j4) * l1.get(i5, k4));
                }
                B.set(k4, j4, B.get(k4, j4) / l1.get(k4, k4));
            }
        }
        return B;
    }
}

class nipals {
    constructor(X, options3 = {}) {
        X = WrapperMatrix2D.checkMatrix(X);
        let {Y} = options3;
        const {scaleScores = false, maxIterations = 1000, terminationCriteria = 0.0000000001} = options3;
        let u;
        if (Y) {
            if (Array.isArray(Y) && typeof Y[0] === "number") {
                Y = Matrix.columnVector(Y);
            } else {
                Y = WrapperMatrix2D.checkMatrix(Y);
            }
            if (!Y.isColumnVector() || Y.rows !== X.rows) {
                throw new Error("Y must be a column vector of length X.rows");
            }
            u = Y;
        } else {
            u = X.getColumnVector(0);
        }
        let diff = 1;
        let t1, q, w, tOld;
        for (let counter = 0; counter < maxIterations && diff > terminationCriteria; counter++) {
            w = X.transpose().mmul(u).div(u.transpose().mmul(u).get(0, 0));
            w = w.div(w.norm());
            t1 = X.mmul(w).div(w.transpose().mmul(w).get(0, 0));
            if (counter > 0) {
                diff = t1.clone().sub(tOld).pow(2).sum();
            }
            tOld = t1.clone();
            if (Y) {
                q = Y.transpose().mmul(t1).div(t1.transpose().mmul(t1).get(0, 0));
                q = q.div(q.norm());
                u = Y.mmul(q).div(q.transpose().mmul(q).get(0, 0));
            } else {
                u = t1;
            }
        }
        if (Y) {
            let p2 = X.transpose().mmul(t1).div(t1.transpose().mmul(t1).get(0, 0));
            p2 = p2.div(p2.norm());
            let xResidual = X.clone().sub(t1.clone().mmul(p2.transpose()));
            let residual = u.transpose().mmul(t1).div(t1.transpose().mmul(t1).get(0, 0));
            let yResidual = Y.clone().sub(t1.clone().mulS(residual.get(0, 0)).mmul(q.transpose()));
            this.t = t1;
            this.p = p2.transpose();
            this.w = w.transpose();
            this.q = q;
            this.u = u;
            this.s = t1.transpose().mmul(t1);
            this.xResidual = xResidual;
            this.yResidual = yResidual;
            this.betas = residual;
        } else {
            this.w = w.transpose();
            this.s = t1.transpose().mmul(t1).sqrt();
            if (scaleScores) {
                this.t = t1.clone().div(this.s.get(0, 0));
            } else {
                this.t = t1;
            }
            this.xResidual = X.sub(t1.mmul(w.transpose()));
        }
    }
}

export class MultivariateLinearRegression {
    constructor(x1, y, options4 = {}) {
        const {intercept = true, statistics = true} = options4;
        this.statistics = statistics;
        if (x1 === true) {
            this.weights = y.weights;
            this.inputs = y.inputs;
            this.outputs = y.outputs;
            this.intercept = y.intercept;
        } else {
            x1 = new Matrix(x1);
            y = new Matrix(y);
            if (intercept) {
                x1.addColumn(new Array(x1.rows).fill(1));
            }
            let xt = x1.transpose();
            const xx = xt.mmul(x1);
            const xy = xt.mmul(y);
            const invxx = new SingularValueDecomposition(xx).inverse();
            const beta = xy.transpose().mmul(invxx).transpose();
            this.weights = beta.to2DArray();
            this.inputs = x1.columns;
            this.outputs = y.columns;
            if (intercept) {
                this.inputs--;
            }
            this.intercept = intercept;
            if (statistics) {
                const fittedValues = x1.mmul(beta);
                const residuals = y.clone().addM(fittedValues.neg());
                const variance = residuals.to2DArray().map((ri) => Math.pow(ri[0], 2)
                ).reduce((a2, b) => a2 + b
                ) / (y.rows - x1.columns);
                this.stdError = Math.sqrt(variance);
                this.stdErrorMatrix = pseudoInverse(xx).mul(variance);
                this.stdErrors = this.stdErrorMatrix.diagonal().map((d1) => Math.sqrt(d1)
                );
                this.tStats = this.weights.map((d1, i5) => this.stdErrors[i5] === 0 ? 0 : d1[0] / this.stdErrors[i5]
                );
            }
        }
    }

    static load(model) {
        if (model.name !== "multivariateLinearRegression") {
            throw new Error("not a MLR model");
        }
        return new MultivariateLinearRegression(true, model);
    }

    predict(x) {
        if (Array.isArray(x)) {
            if (typeof x[0] === "number") {
                return this._predict(x);
            } else if (Array.isArray(x[0])) {
                const y1 = new Array(x.length);
                for (let i5 = 0; i5 < x.length; i5++) {
                    y1[i5] = this._predict(x[i5]);
                }
                return y1;
            }
        } else if (Matrix.isMatrix(x)) {
            const y1 = new Matrix(x.rows, this.outputs);
            for (let i5 = 0; i5 < x.rows; i5++) {
                y1.setRow(i5, this._predict(x.getRow(i5)));
            }
            return y1;
        }
        throw new TypeError("x must be a matrix or array of numbers");
    }

    _predict(x) {
        const result = new Array(this.outputs);
        if (this.intercept) {
            for (let i5 = 0; i5 < this.outputs; i5++) {
                result[i5] = this.weights[this.inputs][i5];
            }
        } else {
            result.fill(0);
        }
        for (let i5 = 0; i5 < this.inputs; i5++) {
            for (let j4 = 0; j4 < this.outputs; j4++) {
                result[j4] += this.weights[i5][j4] * x[i5];
            }
        }
        return result;
    }

    score() {
        throw new Error("score method is not implemented yet");
    }

    toJSON() {
        return {
            name: "multivariateLinearRegression",
            weights: this.weights,
            inputs: this.inputs,
            outputs: this.outputs,
            intercept: this.intercept,
            summary: this.statistics ? {
                regressionStatistics: {
                    standardError: this.stdError,
                    observations: this.outputs
                },
                variables: this.weights.map((d1, i5) => {
                    return {
                        label: i5 === this.weights.length - 1 ? "Intercept" : `X Variable ${i5 + 1}`,
                        coefficients: d1,
                        standardError: this.stdErrors[i5],
                        tStat: this.tStats[i5]
                    };
                })
            } : void 0
        };
    }
}

export {MultivariateLinearRegression as MLR};
