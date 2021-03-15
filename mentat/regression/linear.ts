// import Matrix, { SVD, pseudoInverse } from 'ml-matrix';
import {Matrix, Vector, Zeros} from '../linalg/core.ts';

interface Options {
    intercept?: boolean,
    statistics?: boolean
}

export class MultivariateLinearRegression {

    private readonly statistics: boolean;
    private x: Matrix;
    private y: Matrix;
    private weights: Array<Array<number>>;
    private inputs: number;
    private outputs: number;
    private intercept: boolean;
    private stdError?: number;
    private stdErrors?: Vector
    private stdErrorMatrix?: Matrix;
    private tStats?: any

    constructor(x: Matrix, y: Matrix, options: Options = {}) {
        const {intercept = true, statistics = true} = options;
        this.statistics = statistics;
        this.x = x;
        this.y = y;
        if (intercept) {
            let new_col = new Array(x.rows).fill(1);
            console.log(new_col)
            x.addColumn(new_col);
        }
        let xt = x.transpose();
        console.log(xt.toString(1))
        const xx = xt.multiply(x) as Matrix;
        const xy = xt.multiply(y) as Matrix;
        const invxx = xx.llt_inverse();
        const beta = (xy
            .transpose()
            .multiply(invxx) as Matrix)
            .transpose();
        this.weights = beta.asNestedArray();
        this.inputs = x.cols;
        this.outputs = y.cols;
        if (intercept) this.inputs--;
        this.intercept = intercept;
        if (statistics) {
            /*
             * Let's add some basic statistics about the beta's to be able to interpret them.
             * source: http://dept.stat.lsa.umich.edu/~kshedden/Courses/Stat401/Notes/401-multreg.pdf
             * validated against Excel Regression AddIn
             * test: "datamining statistics test"
             */
            const fittedValues = x.multiply(beta);
            const residuals = y.copy().add((fittedValues as Matrix).neg());
            const variance =
                residuals
                    .asNestedArray()
                    .map((ri) => Math.pow(ri[0], 2))
                    .reduce((a, b) => a + b) /
                (y.rows - x.cols);
            this.stdError = Math.sqrt(variance);
            this.stdErrorMatrix = xx.lu_inverse().map((x: number) => x * variance);
            this.stdErrors = this.stdErrorMatrix
                .diagonal()
                .map((d: number) => Math.sqrt(d));
            this.tStats = this.weights.map((d, i) =>
                this.stdErrors!.data[i] === 0 ? 0 : d[0] / this.stdErrors!.data[i],
            );
        }
        // }
    }

    predict(x: Matrix | Array<number>) {
        if (Array.isArray(x)) {

            return this._predict(x);

        } else if (x instanceof Matrix) {
            const y = Zeros(x.rows, this.outputs);
            for (let i = 0; i < x.rows; i++) {
                y.setRow(i, this._predict(x.row(i)));
            }
            return y;
        }
        throw new TypeError('x must be a matrix or array of numbers');
    }

    _predict(x: Vector | Array<number>) {
        if (x instanceof Vector) {
            x = Array.from(x.data)
        }
        const result = new Array(this.outputs);
        if (this.intercept) {
            for (let i = 0; i < this.outputs; i++) {
                result[i] = this.weights[this.inputs][i];
            }
        } else {
            result.fill(0);
        }
        for (let i = 0; i < this.inputs; i++) {
            for (let j = 0; j < this.outputs; j++) {
                result[j] += this.weights[i][j] * x[i];
            }
        }
        return result;
    }

    score() {
        throw new Error('score method is not implemented yet');
    }

    toJSON() {
        return {
            name: 'multivariateLinearRegression',
            weights: this.weights,
            inputs: this.inputs,
            outputs: this.outputs,
            intercept: this.intercept,
            summary: this.statistics
                ? {
                    regressionStatistics: {
                        standardError: this.stdError,
                        observations: this.outputs,
                    },
                    variables: this.weights.map((d, i) => {
                        return {
                            label:
                                i === this.weights.length - 1
                                    ? 'Intercept'
                                    : `X Variable ${i + 1}`,
                            coefficients: d,
                            standardError: this.stdErrors!.data[i],
                            tStat: this.tStats[i],
                        };
                    }),
                }
                : undefined,
        };
    }

    // static load(model) {
    //     if (model.name !== 'multivariateLinearRegression') {
    //         throw new Error('not a MLR model');
    //     }
    //     return new MultivariateLinearRegression(true, model);
    // }
}
