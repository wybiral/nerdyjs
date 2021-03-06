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
    /** Regularized Feedforward
    <a href="http://en.wikipedia.org/wiki/Artificial_neural_network">neural network</a> classifier
    trained with <a href="http://en.wikipedia.org/wiki/Backpropagation">backpropagation algorithm</a>
     * @function neural
     * @memberof nerdy
     * @param {options} options Options for Neural Network
     * @return {function(Object): boolean} The resulting classifier
     * @example
// Compute Neural Network on "data" nerdy.Dataset
// Attempting to classify the truth that column "d" == 1
// As a function of the columns "a", "b", and "c"
var nn = nerdy.neural({
    samples: data,
    x: ['a', 'b', 'c'],
    y: 'd == 1',
    // Number of hidden units (default is 1)
    hidden: 5,
    // Regularization term (default is 0)
    lambda: 0.05
});
// Perform a classification
console.log(nn({a: 1, b: 2, c: 3}));
// Get score
var score = nn.score({a: 1, b: 2, c: 3});
console.log('true:', score);
console.log('false:', 1 - score);
     */
    nerdy.neural = function(options) {
        _.defaults(options, {
            hidden: 1,
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
        y = transpose([samples.select(options.y)]);
        var hidden = options.hidden;
        var shape = [];
        shape.push([X[0].length, hidden]);
        shape.push([hidden + 1, 1]);
        var weights = shape[0][0] * shape[0][1] + shape[1][0] * shape[1][1];
        var theta = sub(numeric.random([weights]), 0.5);
        // Reshape returns two theta matrices from a flat theta vector
        function reshape(theta) {
            var theta1 = [],
                theta2 = [],
                size = shape[0][1];
            for (var i = 0; i < shape[0][0]; i++) {
                theta1.push(theta.slice(i * size, i * size + size));
            }
            theta = theta.slice(shape[0][0] * shape[0][1]);
            size = shape[1][1];
            for (var i = 0; i < shape[1][0]; i++) {
                theta2.push(theta.slice(i * size, i * size + size));
            }
            return [theta1, theta2];
        };

        var costFunction = function(theta) {
            theta = reshape(theta);
            // Feedforward X -> a1 -> a2 -> a3 (the current hypothesis)
            var a1 = X;
            var z2 = dot(a1, theta[0]);
            var a2 = z2.map(function(x) {
                return [1].concat(x.map(nerdy.sigmoid));
            });
            var z3 = dot(a2, theta[1]);
            var a3 = z3.map(function(x) {
                return x.map(nerdy.sigmoid);
            });
            var cost = sum(sub(mul(neg(y), log(a3)), mul(sub(1, y), log(sub(1, a3))))) / X.length;
            // Regularize cost (not for bias/intercept)
            cost += (lambda / (2 * X.length)) * (sum(pow(theta[0].slice(1), 2)) + sum(pow(theta[1].slice(1), 2)));
            // Backpropagate error -> d3 -> d2
            var d3 = sub(a3, y);
            var d2 = mul(dot(d3, transpose(theta[1].slice(1))), z2.map(function(x) {
                return x.map(nerdy.sigmoidGradient);
            }));
            var D1 = transpose(div(dot(transpose(d2), a1), X.length));
            var D2 = transpose(div(dot(transpose(d3), a2), X.length));
            // Zero out the bias/intercept terms in theta to avoid regularization
            theta[0][0] = theta[0][0].map(function() {return 0;});
            theta[1][0] = theta[1][0].map(function() {return 0;});
            // Regulatize gradient
            D1 = add(D1, mul(lambda / X.length, theta[0]));
            D2 = add(D2, mul(lambda / X.length, theta[1]));
            return {cost: cost, gradient: _.flatten([D1, D2])};
        };

        theta = nerdy.minimize(costFunction, theta, iterations);
        theta = reshape(theta);

        var result = function(){};
        result = function(obj) {
            cutoff = (typeof cutoff == 'undefined' ? 0.5 : cutoff);
            return result.score(obj) > cutoff;
        };

        result.score = function(obj) {
            var vector = features.extract(obj);
            var x = dot(vector, theta[0]);
            x = x.map(nerdy.sigmoid);
            x = dot([1].concat(x), theta[1]);
            x = x.map(nerdy.sigmoid);
            return x[0];
        };

        result.hidden = hidden;
        result.weights = theta;

        return result;
    };
});
