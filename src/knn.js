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
    /** <a href="https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm">k Nearest Neighbor Classifier</a>
     * @function knn
     * @memberof nerdy
     * @param {options} options Options for k Nearest Neighbor
     * @return {function(Object)} The resulting classifier
     * @example
// Compute k Nearest Neighbor on "data" nerdy.Dataset
// Attempting to classify the truth that column "d" == 1
// As a function of the columns "a", "b", and "c"
var knn = nerdy.knn({
    samples: data,
    x: ['a', 'b', 'c'],
    y: 'd == 1',
    // k is the number of neighbors to look at
    k: 3
});
// Perform a classification
console.log(knn({a: 1, b: 2, c: 3}));
     */
    nerdy.knn = function(options) {
        _.defaults(options, {
            k: 5,
            expansion: 'linear',
            standardize: true,
            distance: nerdy.distance
        });
        var distance = options.distance;
        var samples = options.samples;
        var features = nerdy.featureSet(samples, options);
        var X = features.matrix;
        var y = samples.map(options.y);
        var k = options.k;
        var result = function(obj) {
            var vector = features.extract(obj);
            var distances = _.map(X, function(sample) {
                return distance(vector, sample);
            });
            var sorted = _.sortBy(y, function(x, i) {
                return distances[i];
            });
            var counts = _.countBy(sorted.slice(0, k));
            var best = null, count = -Infinity;
            for (var key in counts) {
                if (counts[key] > count) {
                    count = counts[key];
                    best = key;
                }
            }
            return best;
        };
        return result;
    };
});
