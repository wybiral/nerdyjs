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
    /** <a href="http://en.wikipedia.org/wiki/Hierarchical_clustering">Hierarchical Clustering</a>
     * @function hclust
     * @memberof nerdy
     * @param {options} options Options for hierarchical clustering
     * @return {Array} The resulting tree
     * @example
// Cluster "data" nerdy.Dataset
// Based on the columns "a", "b", and "c"
var tree = nerdy.hclust({
    samples: data,
    // Distance function between two vector (default is euclidean)
    distance: nerdy.distance.euclidean,
    // Linkage can be single, complete, or average (default is single)
    linkage: 'single',
    x: ['a', 'b', 'c'],
});
console.log(tree);
     */
    nerdy.hclust = function(options) {
        _.defaults(options, {
            linkage: 'single',
            distance: nerdy.distance,
            expansion: 'linear'
        });
        var samples = options.samples;
        var features = nerdy.featureSet(samples, options);
        var X = features.matrix;
        var linkage = options.linkage;
        var distance = options.distance;
        var m = X.length;
        // Distance matrix where the diagonal will be Infinity
        var dists = numeric.rep([m, m], Infinity);
        // Vector of indices for closest cluster for ith cluster
        var mins = numeric.rep([m], 0);
        // Create distance matrix and vector of minimum indices
        for (var i = 0; i < m; i++) {
            for (var j = 0; j < m; j++) {
                if (i != j) {
                    dists[i][j] = distance(X[i], X[j]);
                }
                if (dists[i][j] < dists[i][mins[i]]) {
                    mins[i] = j;
                }
            }
        }
        var root = null;
        var sizes = numeric.rep([m], 1);
        var clusters = numeric.linspace(0, m - 1);
        for (var p = 0; p < m - 1; p++) {
            // c1 and c2 are two closest clusters to one another
            var c1 = 0;
            for (var i = 0; i < m; i++) {
                if (dists[i][mins[i]] < dists[c1][mins[c1]]) {
                    c1 = i;
                }
            }
            var c2 = mins[c1];
            // node contains each cluster
            var node = [clusters[c1], clusters[c2]];
            clusters[c1] = node;
            sizes[c1] += sizes[c2];
            // Adjust distances to new cluster according to linkage
            for (var j = 0; j < m; j++) {
                switch (linkage) {
                    case 'single':
                        if (dists[c1][j] > dists[c2][j]) {
                            dists[j][c1] = dists[c1][j] = dists[c2][j];
                        }
                        break;
                    case 'complete':
                        if (dists[c1][j] < dists[c2][j]) {
                            dists[j][c1] = dists[c1][j] = dists[c2][j];
                        }
                        break;
                    case 'average':
                        var a = sizes[c1] * dists[c1][j];
                        var b = sizes[c2] * dists[c2][j];
                        dists[j][c1] = dists[c1][j] = (a + b) / (sizes[c1] + sizes[j]);
                        break;
                }
            }
            // our linkage loop unset this, fix it
            dists[c1][c1] = Infinity;
            // c2 is useless now, make it infinite distance
            for (var i = 0; i < m; i++) {
                dists[i][c2] = dists[c2][i] = Infinity;
            }
            // Recalculate minimums
            for (var j = 0; j < m; j++) {
                if (mins[j] == c2) {
                    mins[j] = c1;
                }
                if (dists[c1][j] < dists[c1][mins[c1]]) {
                    mins[c1] = j;
                }
            }
            root = node;
        }
        return root;
    };
});
