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
    /** <a href="http://en.wikipedia.org/wiki/Logistic_regression">Logistic Regression Classifier</a>
     * @function logreg
     * @memberof nerdy
     * @param {options} options Options for logistic regression
     * @return {function(Object): boolean} The resulting classifier
     * @example
// Compute Logistic Regression on "data" nerdy.Dataset
// Attempting to classify the truth that column "d" == 1
// As a function of the columns "a", "b", and "c"
var lr = nerdy.logreg({
    samples: data,
    x: ['a', 'b', 'c'],
    y: 'd == 1',
    // Expand features into a quadratic space
    // Options are linear (default), quadratic, and cubic
    expansion: 'quadratic',
    // Regularization term (default is 0)
    lambda: 0.05
});
// Perform a classification
console.log(lr({a: 1, b: 2, c: 3}));
// Get score
var score = lr.score({a: 1, b: 2, c: 3});
console.log('true:', score);
console.log('false:', 1 - score);
     */
    nerdy.logreg = function(options) {
        _.defaults(options, {
            intercept: true,
            expansion: 'linear',
            standardize: true,
            lambda: 0.0,
            iterations: 1000
        });
        var X, y;
        var samples = options.samples;
        var features = nerdy.featureSet(samples, options);
        var lambda = options.lambda;
        var iterations = options.iterations;
        X = features.matrix;
        y = samples.select(options.y);
        var costFunction = function(theta) {
            var H = dot(X, theta).map(nerdy.sigmoid);
            var cost = dot(y, log(H));
            cost += dot(sub(1, y), log(sub(1, H)));
            cost = -cost / X.length;
            cost += lambda / 2 / X.length * sum(pow(theta.slice(1), 2));
            var regularization = mul(theta, lambda / X.length);
            regularization[0] = 0.0;
            var gradient = dot(transpose(X), sub(H, y));
            diveq(gradient, X.length);
            addeq(gradient, regularization);
            return {cost: cost, gradient: gradient};
        };
        var theta = numeric.rep([X[0].length], 0);
        theta = nerdy.minimize(costFunction, theta, iterations);
        var result = function(){};
        result = function(obj, cutoff) {
            cutoff = typeof cutoff == 'undefined' ? 0.5 : cutoff;
            return result.score(obj) > cutoff;
        };
        result.score = function(obj) {
            vector = features.extract(obj);
            return nerdy.sigmoid(dot(theta, vector));
        };

        result.coefficients = theta;

        return result;
    };
});
