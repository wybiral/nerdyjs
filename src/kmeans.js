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
    /** <a href="http://en.wikipedia.org/wiki/K-means_algorithm">k Means Clustering</a>
     * @function kmeans
     * @memberof nerdy
     * @param {options} options Options for k Means
     * @return {function(Object): number} The resulting classifier
     * @example
// Compute k Means on "data" nerdy.Dataset
// As a function of the columns "a", "b", and "c"
var km = nerdy.kmeans({
    samples: data,
    x: ['a', 'b', 'c'],
    // k is the number of clusters to find
    k: 3,
});
// Perform a classification (returns number of closest centroid)
console.log(km({a: 1, b: 2, c: 3}));
// Access the array of centroids (order is same as cluster number)
console.log(km.means);
     */
    nerdy.kmeans = function(options) {
        _.defaults(options, {
            expansion: 'linear',
            standardize: true,
            distance: nerdy.distance
        });
        var samples = options.samples;
        var features = nerdy.featureSet(samples, options);
        var X = features.matrix;
        X = _.shuffle(X);
        var k = options.k;
        var distance = options.distance;
        var m = X.length, n = X[0].length;
        var converged = false;
        var means = X.slice(0, k);
        var groups = numeric.rep([m], 0);
        while (!converged) {
            // If we change any clusters, this will be set to false
            converged = true;
            // Keep track of cluster sizes and next set of means
            var sizes = numeric.rep([k], 0);
            var nextMeans = numeric.rep([k, n], 0);
            _.each(X, function(vector, i) {
                // Get nearest cluster index
                var c = _.min(_.range(k), function(j) {
                    return distance(vector, means[j]);
                });
                // Change the cluster to a closer one, also we didn't converge
                if (groups[i] != c) {
                    groups[i] = c;
                    converged = false;
                }
                // Update totals
                nextMeans[c] = add(nextMeans[c], vector);
                sizes[c] += 1;
            });
            if (!converged) {
                // Divide all the totals by their sizes to get the next means
                _.each(nextMeans, function(mean, j) {
                    if (sizes[j] > 0) {
                        mean = div(mean, sizes[j]);
                    }
                    means[j] = mean;
                });
            }
        }
        var result = function(obj) {
            var vector = features.extract(obj);
            return _.min(_.range(k), function(j) {
                return distance(vector, means[j]);
            });
        };
        result.means = means;
        return result;
    };
});
