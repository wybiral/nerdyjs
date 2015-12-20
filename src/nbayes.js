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
    /** <a href="https://en.wikipedia.org/wiki/Naive_Bayes_classifier">Naive bayes Classifier</a>
     * @function nbayes
     * @memberof nerdy
     * @param {options} options Options for naive bayes
     * @return {function(Object): boolean} The resulting classifier
     * @example
// Compute naive bayes on "data" nerdy.Dataset
// Attempting to classify the truth that column "d" == 1
// As a function of the columns "a", "b", and "c"
var nb = nerdy.nbayes({
    samples: data,
    x: ['a', 'b', 'c'],
    y: 'd == 1'
});
// Perform a classification
console.log(nb({a: 1, b: 2, c: 3}));
// Get scores
var scores = nb.score({a: 1, b: 2, c: 3});
console.log('true:', scores[true]);
console.log('false:', scores[false]);
     */
    nerdy.nbayes = function(options) {
        var dependent = options.y;
        var independents = _.isArray(options.x) ? options.x : [options.x];
        var samples = options.samples;
        // Extract positive samples
        var positiveSamples = samples.where(dependent);
        // Get prior of positive class
        var positiveProb = positiveSamples.count() / samples.count();
        // Get mean of positive features
        var positiveMean = _.map(independents, function(key, j) {
            return positiveSamples.mean(key);
        });
        // Get variance of positive features
        var positiveVar = _.map(independents, function(key, j) {
            return positiveSamples.variance(key, positiveMean[j]);
        });
        // Extract negative samples
        var negativeSamples = samples.where('!(' + dependent + ')');
        // Get prior of negative class
        var negativeProb = negativeSamples.count() / samples.count();
        // Get mean of negative features
        var negativeMean = _.map(independents, function(key, j) {
            return negativeSamples.mean(key);
        });
        // Get variance of negative features
        var negativeVar = _.map(independents, function(key, j) {
            return negativeSamples.variance(key, negativeMean[j]);
        });
        // Get probability density of x given a mean and variance
        function getProb(x, mean, sd2) {
            return (1 / Math.sqrt(2 * Math.PI * sd2)) * Math.exp(-Math.pow(x - mean, 2) / (2 * sd2));
        }

        var result = function(obj) {
            var scores = result.score(obj);
            return scores[true] > scores[false];
        };

        /*
            Returns an object of
            {true: probabilityOfMatch, false: probabilityOfNotMatch}
        */
        result.score = function(obj) {
            var scores = {}, positive = positiveProb, negative = negativeProb;
            _.each(independents, function(key, j) {
                var posProb = getProb(obj[key], positiveMean[j], positiveVar[j]);
                var negProb = getProb(obj[key], negativeMean[j], negativeVar[j]);
                positive *= posProb;
                negative *= negProb;
            });
            scores[true] = positive;
            scores[false] = negative;
            return scores;
        };

        return result;
    };
});
