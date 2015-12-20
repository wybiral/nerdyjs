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
    /** <a href="http://en.wikipedia.org/wiki/Linear_regression">Linear Regression</a>
     * @function linreg
     * @memberof nerdy
     * @param {options} options Options for Linear Regression
     * @return {function(Object): number} The resulting regressor
     * @example
// Compute Linear Regression on "data" nerdy.Dataset
// Attempting to regress the value of the "d" column
// As a function of the columns "a", "b", and "c"
var lr = nerdy.linreg({
    samples: data,
    x: ['a', 'b', 'c'],
    y: 'd',
    // Expand features into a quadratic space
    // Options are linear (default), quadratic, and cubic
    expansion: 'quadratic',
    // Regularization term (default is 0)
    lambda: 0.05
});
// Perform a regression
console.log(lr({a: 1, b: 2, c: 3}));
     */
    nerdy.linreg = function(options) {
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
        X = features.matrix;

        var iterations = options.iterations;
        var lambda = options.lambda;
        y = samples.select(options.y);
        var costFunction = function(theta) {
            var m = X.length;
            // Hypothesis vector given theta
            var H = dot(X, theta);
            // Cost is sum(square(errors)) / 2m
            var cost = sum(pow(sub(H, y), 2)) / (2 * m);
            // Regularize by adding cost for all theta values except the intercept
            cost += (lambda / 2 / m) * sum(pow(theta.slice(1), 2));
            var reg = mul(theta, lambda / m);
            reg[0] = 0.0;
            var gradient = add(div(dot(transpose(X), sub(H, y)), m), reg);
            return {cost: cost, gradient: gradient};
        };

        var theta = numeric.rep([X[0].length], 0);

        theta = nerdy.minimize(costFunction, theta, iterations);

        var result = function(obj) {
            vector = features.extract(obj);
            return dot(theta, vector);
        };
        
        result.coefficients = theta;
        
        // Compute r^2 score
        var Ymean = nerdy.mean(y);
        var H = dot(X, theta);
        var SSregression = nerdy.ss(sub(H, Ymean));
        var SStotal = nerdy.ss(sub(y, Ymean));    
        result.r2 = SSregression / SStotal;
        return result;
    };
});
