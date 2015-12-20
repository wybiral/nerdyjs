Classy.module(function(global) {
    var sum = numeric.sum,
        dot = numeric.dot,
        mul = numeric.mul,
        div = numeric.div,
        add = numeric.add,
        sub = numeric.sub,
        neg = numeric.neg,
        log = numeric.log,
        pow = numeric.pow,
        sqrt = numeric.sqrt,
        abs = numeric.abs,
        transpose = numeric.transpose,
        addeq = numeric.addeq,
        subeq = numeric.subeq,
        muleq = numeric.muleq;
    /** <a href="http://en.wikipedia.org/wiki/Support_vector_machine">Support Vector Machine</a> Classifier
     * @function svm
     * @memberof nerdy
     * @param {options} options Options for Support Vector Machine
     * @return {function(Object): boolean} The resulting classifier
     * @example
// Compute Support Vector Machine on "data" nerdy.Dataset
// Attempting to classify the truth that column "d" == 1
// As a function of the columns "a", "b", and "c"
var svm = nerdy.svm({
    samples: data,
    x: ['a', 'b', 'c'],
    y: 'd == 1',
    // Use gauss/rbf kernel with sigma of 0.5
    // Default kernel is nerdy.svm.kernels.linear
    kernel: nerdy.svm.kernels.gauss(0.5),
});
// Perform a classification
console.log(svm({a: 1, b: 2, c: 3}));
// Get score (in this case, between -1 and 1)
var score = svm.score({a: 1, b: 2, c: 3});
// Using sigmoid to squeeze between 0 and 1
console.log('true:', nerdy.sigmoid(score));
console.log('false:', 1 - nerdy.sigmoid(score));
     */
    nerdy.svm = function(options) {
        _.defaults(options, {
            intercept: true,
            kernel: nerdy.svm.kernels.linear,
            standardize: true,
            C: 1.0,
            tol: 1e-4,
            iterations: 10000
        });
        var X, y;
        var samples = options.samples;
        var features = nerdy.featureSet(samples, options);
        X = features.matrix;
        y = _.map(samples.select(options.y), function(value) {
            return value ? 1 : -1;
        });

        var C = options.C; // C value. Decrease for more regularization
        var tol = options.tol; // numerical tolerance. Don't touch unless you're pro
        var iterations = options.iterations; // max number of iterations
        var kernel = options.kernel; // default : linear kernel
        // how many passes over data with no change before we halt? Increase for more precision.
        var numpasses = options.numpasses || 10; 

        var n = X.length;
        var alpha = numeric.rep([n], 0);
        var b = 0;

        var iter = 0;
        var passes = 0;

        var marginOne = function(vector) {
            var f = b;
            for(var i = 0; i < n; i++) {
                f += alpha[i] * y[i] * kernel(vector, X[i]);
            }
            return f;
        };

        while (passes < numpasses && iter < iterations) {
            var alphaChanged = 0;
            for (var i = 0; i < n; i++) {
                var Ei= marginOne(X[i]) - y[i];
                if ((y[i] * Ei < -tol && alpha[i] < C) || (y[i] * Ei > tol && alpha[i] > 0) ) {
                    // alpha_i needs updating! Pick a j to update it with
                    var j = i;
                    while(j === i) {
                        j = Math.floor(Math.random() * n);
                    }
                    var Ej = marginOne(X[j]) - y[j];
                    // calculate L and H bounds for j to ensure we're in [0 C]x[0 C] box
                    ai = alpha[i];
                    aj = alpha[j];
                    var L = 0, H = C;
                    if (y[i] === y[j]) {
                        L = Math.max(0, ai + aj - C);
                        H = Math.min(C, ai + aj);
                    } else {
                        L = Math.max(0, aj - ai);
                        H = Math.min(C, C + aj - ai);
                    }
                    if (Math.abs(L - H) < tol) {
                        continue;
                    }
                    var eta = 2 * kernel(X[i], X[j]) - kernel(X[i], X[i]) - kernel(X[j], X[j]);
                    if (eta >= 0) {
                        continue;
                    }
                    // compute new alpha_j and clip it inside [0 C]x[0 C] box
                    // then compute alpha_i based on it.
                    var newaj = aj - y[j] * (Ei - Ej) / eta;
                    if (newaj > H) {
                        newaj = H;
                    }
                    if (newaj < L) {
                        newaj = L;
                    }
                    if (Math.abs(aj - newaj) < tol) {
                        continue; 
                    }
                    alpha[j] = newaj;
                    var newai = ai + y[i] * y[j] * (aj - newaj);
                    alpha[i] = newai;
                    // update the bias term
                    var b1 = b - Ei - y[i] * (newai - ai) * kernel(X[i], X[i])
                                    - y[j] * (newaj - aj) * kernel(X[i], X[j]),
                        b2 = b - Ej - y[i] * (newai - ai) * kernel(X[i], X[j])
                                    - y[j] * (newaj - aj) * kernel(X[j], X[j]);
                    b = 0.5 * (b1 + b2);
                    if (newai > 0 && newai < C) {
                        b = b1;
                    }
                    if (newaj > 0 && newaj < C) {
                        b = b2;
                    }
                    alphaChanged++;
                } // end alpha_i needed updating
            } // end for i=1..N

            iter++;

            if(alphaChanged == 0) {
                passes++;
            } else {
                passes = 0;
            }
        }
        var result = function(obj) {
            return result.score(obj) > 0;
        };
        result.score = function(obj) {
            var vector = features.extract(obj);
            return marginOne(vector);
        };
        return result;
    };

    nerdy.svm.kernels = {
        linear: function (v1, v2) {
            var s = 0; 
            for(var q = 0; q < v1.length; q++) {
                s += v1[q] * v2[q];
            }
            return s;
        },
        gauss: function(sigma) {
            return function(v1, v2) {
                var s = 0;
                for(var q = 0; q < v1.length; q++) {
                    s += (v1[q] - v2[q]) * (v1[q] - v2[q]);
                }
                return Math.exp(-s / (2.0 * sigma * sigma));
            };
        }
    };
});
