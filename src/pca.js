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
    /** <a href="https://en.wikipedia.org/wiki/Principal_component_analysis">Principle Component Analysis</a>
     * @function pca
     * @memberof nerdy
     * @param {options} options Options for Principle Component Analysis
     * @return {function} The resulting dimensionality reducer
     * @example
// Compute Principle Component Analysis on "data" nerdy.Dataset
// As a function of the columns "a", "b", and "c"
var pca = nerdy.pca({
    samples: data,
    x: ['a', 'b', 'c'],
});
// Project object into first two principle components
var projected = pca({a: 1, b: 2, c: 3]);
// Get number of principle components required to maintain 95% variance
var required = pca.required(0.95);
     */
    nerdy.pca = function(options) {
        _.defaults(options, {
            intercept: false,
            standardize: true
        });
        var samples = options.samples;
        var features = nerdy.featureSet(samples, options);
        var X = features.matrix;
        var m = X.length;
        var sigma = div(dot(transpose(X), X), m);
        var svd = numeric.svd(sigma);
        var result = function(obj) {
            var components;
            if (arguments.length > 1) {
                if (_.isArray(arguments[1])) {
                    components = arguments[1];
                } else {
                    components = _.range(arguments[1]);
                }
            } else {
                components = _.range(X[0].length);
            }
            var vector = features.extract(obj);
            return dot(vector, _.map(svd.U, function(row) {
                return _.map(components, function(k) {
                    return row[k];
                });
            }));
        };
        // Return number of principle components required to maintain variance
        result.required = function(variance) {
            var S = svd.S, n = S.length, k = n;
            while (k--) {
                var v = sum(S.slice(0, k)) / sum(S.slice(0, n));
                if (v < variance) {
                    return k + 1;
                }
            }
            return 1;
        };
        result.x = options.x;
        result.matrix = svd.U;
        return result;
    };
});
