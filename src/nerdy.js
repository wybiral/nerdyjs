/** The main namespace for nerdy
  * @main nerdy
  * @namespace nerdy
  * @author Davy Wybiral
  */

Classy.module(function(global) {

    var Matrix = Classy.validator('_.isArray(x) && _.isArray(x[0])');
    var Vector = Classy.validator('_.isArray(x) && (x.length == 0 || _.isNumber(x[0]))');

    var nerdy = {};

    // Shortcut a bunch of numeric functions
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

    /** Evaluate polynomial coefficients with variable x
     * @function polyval
     * @memberof nerdy
     * @param {Array.<number>} coefs An array of polynomial coefficients
     * @param {number} x
     * @return {number}
     * @example nerdy.polyval([1, 2, 3], 5) == 1 + (2 * 5) + (3 * 5 * 5)
     */
    nerdy.polyval = function(coefs, x) {
        var sum = 0.0, p = 1, n = coefs.length;
        for (var i = 0; i < n; i++) {
            sum += p * coefs[i];
            p *= x;
        }
        return sum;
    };

    /** Return sum of an array
     * @method sum
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @return {number}
     * @example nerdy.sum([1, 2, 3]) == 6
     */
    nerdy.sum = Classy.method()
        .when([Matrix], function(matrix) {
            var out = numeric.rep([matrix[0].length], 0);
            for (var i = 0; i < matrix.length; i++) {
                addeq(out, matrix[i]);
            }
            return out;
        })
        .when([Vector], function(vector) {
            return numeric.sum(vector);
        });

    /** Return sum of squares of an array
     * @method ss
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @return {number}
     * @example nerdy.ss([1, 2, 3]) == 14
     */
    nerdy.ss = function(array) {
        return nerdy.sum(pow(array, 2));
    };

    /** Return mean of an array
     * @function mean
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @return {number}
     * @example nerdy.mean([1, 2, 3]) == 2
     */
    nerdy.mean = function(array) {
        return div(nerdy.sum(array), array.length);
    };

    /** Return variance of an array (with denominator n-1)
     * @function variance
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @param {number=} mean The mean of the array (optional)
     * @return {number}
     * @example nerdy.variance([1, 2, 3]) == 1
     * @example nerdy.variance([1, 2, 3], 2) == 1
     */
    nerdy.variance = function(array, mean) {
        mean = (typeof mean == 'undefined') ? nerdy.mean(array) : mean;
        return div(nerdy.ss(sub(array, mean)), array.length - 1);
    };

    nerdy.sqrt = Classy.method()
        .when([Matrix], function(matrix) {
            return _.map(matrix, function(row) {
                return _.map(row, Math.sqrt);
            });
        })
        .when([Vector], function(vector) {
            return _.map(vector, Math.sqrt);
        })
        .when([Number], Math.sqrt);

    /** Return standard deviation of an array (with denominator n-1)
     * @function sd
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @param {number=} mean The mean of the array (optional)
     * @return {number}
     * @example nerdy.sd([1, 2, 3]) == 1
     * @example nerdy.sd([1, 2, 3], 2) == 1
     */
    nerdy.sd = function(array, mean) {
        return nerdy.sqrt(nerdy.variance(array, mean));
    };

    /** Return minimum value in an array
     * @function min
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @return {number}
     * @example nerdy.min([1, 2, 3]) == 1
     */

    nerdy.min = Classy.method()
        .when([Matrix], function(matrix) {
            return _.map(transpose(matrix), function(row) {
                return Math.prototype.min.apply(Math, row);
            });
        })
        .when([Vector], function(vector) {
            return Math.min.apply(Math, vector);
        });

    /** Return maximum value in an array
     * @function max
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @return {number}
     * @example nerdy.max([1, 2, 3]) == 3
     */
    nerdy.max = Classy.method()
        .when([Matrix], function(matrix) {
            return _.map(transpose(matrix), function(row) {
                return Math.prototype.max.apply(Math, row);
            });
        })
        .when([Vector], function(vector) {
            return Math.max.apply(Math, vector);
        });

    /** Returns median value of an array
     * @function median
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @return {number}
     * @example nerdy.median([1, 2, 3]) == 2
     * @example nerdy.median([1, 2, 3, 4]) == 2.5
     */
    nerdy.median = Classy.method()
        .when([Matrix], function(matrix) {
            return _.map(transpose(matrix), function(row) {
                return nerdy.median(row);
            });
        })
        .when([Vector], function(vector) {
            var sorted = _.sortBy(vector);
            var center = sorted.length / 2;
            var floor = Math.floor(center);
            if (center != floor) {
                // Length is odd, floor is center
                return sorted[floor];
            } else {
                // Length is even, use mean of two centers
                return (sorted[center - 1] + sorted[center]) / 2;
            }
        });

    /** Returns skewness of an array
     * @function skew
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @param {number=} mean The mean of the array (optional)
     * @return {number}
     * @example nerdy.skew([1, 2, 3, 4])
     * @example nerdy.skew([1, 2, 3, 5]) ~= 0.7528371991317256
     */
    nerdy.skew = Classy.method()
        .when([Matrix], function(matrix) {
            return _.map(transpose(matrix), function(row) {
                return nerdy.skew(row);
            });
        })
        .when([Vector], function(vector) {
            var n = vector.length;
            var mean = nerdy.mean(vector);
            var difference = sub(vector, mean);
            var m3 = sum(pow(difference, 3)) / n;
            var m2 = sum(pow(difference, 2)) / n;
            var skew = m3 / Math.pow(m2, 3 / 2);
            return (Math.sqrt(n * (n - 1)) / (n - 2)) * skew;
        });

    /** Returns kurtosis of an array
     * @function kurt
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @param {number=} mean The mean of the array (optional)
     * @return {number}
     * @example nerdy.kurt([1, 2, 3, 4]) == -1.2
     */
    nerdy.kurt = Classy.method()
        .when([Matrix], function(matrix) {
            return _.map(transpose(matrix), function(row) {
                return nerdy.kurt(row);
            });
        })
        .when([Vector], function(vector) {
            var n = vector.length;
            var mean = nerdy.mean(vector);
            var difference = sub(vector, mean);
            var m4 = sum(pow(difference, 4)) / n;
            var m2 = sum(pow(difference, 2)) / n;
            var kurt = (n + 1) * (m4 / Math.pow(m2, 2)) - 3 * (n - 1);
            return ((n - 1) / ((n - 2) * (n - 3))) * kurt;
        });

    /** Return covariance
     * @function cov
     * @memberof nerdy
     * @param {Array.<number>} a An array of numbers
     * @param {Array.<number>} b An array of numbers
     * @return {number}
     * @example nerdy.cov([1, 2, 3], [1, 2, 3]) == 1
     */
    nerdy.cov = function(a, b) {
        var a_mean = nerdy.mean(a),
            b_mean = nerdy.mean(b),
            a_mc = sub(a, a_mean),
            b_mc = sub(b, b_mean);
        return dot(a_mc, b_mc) / (a.length - 1);
    };

    /** Return correlation coefficient (Pearson's)
     * @function cor
     * @memberof nerdy
     * @param {Array.<number>} a An array of numbers
     * @param {Array.<number>} b An array of numbers
     * @return {number}
     * @example nerdy.cor([1, 2, 3], [1, 2, 3]) == 1
     */
    nerdy.cor = function(a, b) {
        var a_mean = nerdy.mean(a),
            b_mean = nerdy.mean(b),
            a_sd = nerdy.sd(a, a_mean),
            b_sd = nerdy.sd(b, b_mean),
            a_mc = sub(a, a_mean),
            b_mc = sub(b, b_mean);
        return dot(div(a_mc, a_sd), div(b_mc, b_sd)) / (a.length - 1);
    };


    /** <div>Return descriptive statistics of an array</div>
<div>Result is an object with the following properties:</div>
        <ul>
            <li>count (number of values)</li>
            <li>mean</li>
            <li>median </li>
            <li>sd (standard deviation)</li>
            <li>se (standard error)</li>
            <li>min</li>
            <li>max</li>
            <li>skew</li>
            <li>ses (standard error of skewness)</li>
            <li>kurt</li>
            <li>sek (standard error of kurtosis)</li>
        </ul>
     * @function describe
     * @memberof nerdy
     * @param {Array.<number>} array An array of numbers
     * @return {Object.<string, number>}
    */
    nerdy.describe = function(array) {
        var n = array.length;
        var mean = nerdy.mean(array);
        var sd = nerdy.sd(array);
        var ses = Math.sqrt((6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3)));
        var sek = 2 * ses * Math.sqrt((n * n - 1) / ((n - 3) * (n + 5)));
        return {
            count: n,
            mean: mean,
            median: nerdy.median(array),
            sd: sd,
            se: sd / Math.sqrt(array.length),
            min: nerdy.min(array),
            max: nerdy.max(array),
            skew: nerdy.skew(array),
            ses: ses,
            kurt: nerdy.kurt(array),
            sek: sek
        };
    };

    /* XXX: Where should this go?
    nerdy.tTest = function(options) {
        var samples = options.samples;
        var groupLabels = samples.distinct(options.group);
        var groupA = samples.where(options.group + ' == "' + groupLabels[0] + '"');
        var groupB = samples.where(options.group + ' == "' + groupLabels[1] + '"');

        var nA = groupA.count();
        var nB = groupB.count();
        var meanA = groupA.mean(options.test);
        var meanB = groupB.mean(options.test);
        var sumA = groupA.sum(options.test);
        var sumB = groupB.sum(options.test);
        var ssA = groupA.ss(options.test);
        var ssB = groupB.ss(options.test);
        
        var a = ssA - (sumA * sumA) / nA;
        var b = ssB - (sumB * sumB) / nB;
        var c = ((a + b) / (nA + nB - 2)) * (1 / nA + 1 / nB);
        var t = (meanA - meanB) / Math.sqrt(c);
        var df = nA + nB - 2;
        var p = nerdy.tpdf(df, t);
        return {df: df, t: t, p: p};
    };
    */

    /** <div><a href="http://en.wikipedia.org/wiki/One-way_analysis_of_variance">One-way ANOVA</a></div>
     * Resulting objects has properties {model: {SS:, df:, MS:, F:, p:}, error: {SS:, df:, MS:}, total: {SS: df:}}
     * @function anova
     * @memberof nerdy
     * @param {options} options Options for one-way ANOVA
     * @return {Object} The resulting analysis
     * @example
    // Compute ANOVA of "data" nerdy.Dataset
    // "data" has two columns, "feature" and "group"
    // Looking for ANOVA of "feature" values between "group"s
    var anova = nerdy.anova({
        samples: data,
        x: 'feature',
        y: 'group'
    });
    console.log(anova.model.F)
     */
    nerdy.anova = function(options) {
        var samples = options.samples;
        var groupLabels = samples.distinct(options.group);
        var groups = _.map(groupLabels, function(label) {
            return samples.where(options.group + ' == "' + label + '"').select(options.test);
        });
        var means = _.map(groups, nerdy.mean);
        var mean = samples.mean(options.test);
        var SST = sum(pow(sub(samples.select(options.test), mean), 2));
        var SSG = sum(_.map(means, function(x, i) {
            return groups[i].length * Math.pow(x - mean, 2);
        }));
        var SSE = sum(_.map(groups, function(group, i) {
            return sum(pow(sub(group, means[i]), 2));
        }));
        var n = samples.count();
        var k = groups.length;
        var MSG = SSG / (k - 1);
        var MSE = SSE / (n - k);
        var F = MSG / MSE;
        var result = {
            model: {SS: SSG, df: k - 1, MS: MSG, F: F, p: nerdy.fcdf(n - k, k - 1, F)},
            error: {SS: SSE, df: n - k, MS: MSE},
            total: {SS: SST, df: n - 1}
        };
        return result;
    };

    nerdy.lgamma = function(xx) {
        // An approximation of log(gamma(x))
        var j;
        var stp = 2.506628274650;
        var cof = [
            76.18009173,
            -86.50532033,
            24.01409822,
            -1.231739516,
            0.120858003e-02,
            -0.536382e-05
        ];
        
        var x = xx-1;
        var tmp = x + 5.5;
        tmp = (x + 0.5) * Math.log(tmp) - tmp;
        var ser = 1;
        for (j = 0; j < 6; j++) {
            x++;
            ser = ser + cof[j] / x;
        }
        return tmp + Math.log(stp * ser);
    };
    
    nerdy.gamma = function(x) {
        // An approximation of gamma(x)
        var f = 10e99;
        var g = 1;
        if (x > 0) {
            while (x < 3) {
                g = g * x;
                x = x + 1;
            }
            f = (1 - (2 / (7 * Math.pow(x, 2))) * (1 - 2 / (3 * Math.pow(x, 2)))) / (30 * Math.pow(x, 2));
            f = (1 - f) / (12 * x) + x * (Math.log(x) - 1);
            f = (Math.exp(f) / g) * Math.pow(2 * Math.PI / x, 0.5);
        } else {
            f = Infinity;
        }
        return f;
    };

    nerdy.beta = function(a, b) {
        return nerdy.gamma(a) * nerdy.gamma(b) / nerdy.gamma(a + b);
    };

    nerdy.betapdf = function(x, a, b) {
        return Math.exp(
            (a - 1) * Math.log(x) +
            (b - 1) * Math.log(1 - x) +
            nerdy.lgamma(a + b) -
            nerdy.lgamma(a) -
            nerdy.lgamma(b)
        );
    };

    nerdy.betacdf = function(x, a, b) {
        return nerdy.betainc(x, a, b);
    };

    function betacf(x, a, b) {
        var abs = Math.abs,
            MAXIT = 1000,
            EPS = 3e-7,
            FPMIN = 1e-30,
            qab = a + b,
            qap = a + 1,
            qam = a - 1,
            c = 1,
            d = 1 - qab * x / qap;
        if (abs(d) < FPMIN) d = FPMIN;
        d = 1 / d;
        var h = d;
        var m;
        for (m = 1; m <= MAXIT; m++) {
            var m2 = 2 * m;
            var aa = m * (b-m) * x / ((qam + m2) * (a + m2));
            d = 1 + aa * d;
            if (abs(d) < FPMIN) d = FPMIN;
            c = 1 + aa / c;
            if (abs(c) < FPMIN) c = FPMIN;
            d = 1 / d;
            h *= (d * c);
            aa = -(a+m) * (qab+m) * x / ((a+m2) * (qap+m2));
            d = 1 + aa * d;
            if (abs(d) < FPMIN) d = FPMIN;
            c = 1 + aa / c;
            if (abs(c) < FPMIN) c = FPMIN;
            d = 1 / d;
            var del = d*c;
            h *= del;
            if (abs(del - 1) < EPS) break;
        }
        return h;
    };
            
    nerdy.betainc = function(x, a, b) {
        if (x == 0) {
            return 0;
        } else if (x == 1) {
            return 1;
        } else {
            var logBeta = nerdy.lgamma(a + b) -
                nerdy.lgamma(a) -
                nerdy.lgamma(b) +
                a * Math.log(x) + b * Math.log(1 - x);
            if (x < (a + 1) / (a + b + 2)) {
                return Math.exp(logBeta) * betacf(x, a, b) / a;
            } else {
                return 1 - Math.exp(logBeta) * betacf(1 - x, b, a) / b;
            }
        }
    };

    nerdy.fpdf = function(x, v1, v2) {
        var g = nerdy.gamma, pow = Math.pow;
        var num = g((v1 + v2) / 2) * pow(v1 / v2, v1 / 2) * pow(x, v1 / 2 - 1);
        var den = g(v1 / 2) * g(v2 / 2) * pow(1 + (v1 * x) / v2, (v1 + v2) / 2);
        return num / den;
    };

    nerdy.fcdf = function(x, m, n) {
        /*  F distribution with v1, v2 deg. freedom
            P(x>f)
        */
        return 1 - nerdy.betainc (1 / (1 + m * x / n), n / 2, m / 2);
    };
    
    /** Evaluate the pdf of the normal distribution at some point
     * @function normpdf
     * @memberof nerdy
     * @param {number} x Point to evaluate at
     * @return {number}
     */
    nerdy.normpdf = Classy.method()
        .when([Number, Number, Number], function(x, mean, sd) {
            var sd2 = sd * sd;
            return (1 / Math.sqrt(2 * Math.PI * sd2)) *
                Math.exp(-Math.pow(x - mean, 2) / (2 * sd2));
        })
        .when([Number], function(x) {
            return nerdy.normpdf(x, 0, 1);
        });


    /** Evaluate the cdf of the normal distribution at some point
     * @function normcdf
     * @memberof nerdy
     * @param {number} x Point to evaluate at
     * @return {number}
     */
    nerdy.normcdf = Classy.method()
        .when([Number], function(x) {
            var coefs= [
                0.254829592, -0.284496736, 1.421413741,
               -1.453152027,  1.061405429
            ];
            var p  =  0.3275911;
            var sign = x < 0 ? -1 : 1;
            x = Math.abs(x) / Math.sqrt(2.0);
            var t = 1.0 / (1.0 + p * x);
            var y = 1 - nerdy.polyval(coefs, t) * t * Math.exp(-x * x);
            return 0.5 * (1.0 + sign * y);
        })
        .when([Number, Number, Number], function(x, mean, sd) {
            return nerdy.normcdf((x - mean) / sd);
        });


    /** Return area under normal distribution between a and b
     * @function normarea
     * @memberof nerdy
     * @param {number} a Starting point
     * @param {number} b Ending point
     * @return {number} Area of distribution between a and b
     * @example nerdy.normalarea(-2, 2) ~= 0.9544998742254873
     */
    // XXX: Do I need this?
    nerdy.normarea = function(a, b) {
        return Math.abs(nerdy.normcdf(a) - nerdy.normcdf(b));
    };
    
    nerdy.norminv = function(p) {
        // Coefficients in rational approximations
        var a = new Array(-3.969683028665376e+01,  2.209460984245205e+02,
                          -2.759285104469687e+02,  1.383577518672690e+02,
                          -3.066479806614716e+01,  2.506628277459239e+00);
        var b = new Array(-5.447609879822406e+01,  1.615858368580409e+02,
                          -1.556989798598866e+02,  6.680131188771972e+01,
                          -1.328068155288572e+01 );
        var c = new Array(-7.784894002430293e-03, -3.223964580411365e-01,
                          -2.400758277161838e+00, -2.549732539343734e+00,
                          4.374664141464968e+00,  2.938163982698783e+00);
        var d = new Array (7.784695709041462e-03, 3.224671290700398e-01,
                           2.445134137142996e+00,  3.754408661907416e+00);
        // Define break-points.
        var plow  = 0.02425;
        var phigh = 1 - plow;
        // Rational approximation for lower region:
        if (p < plow) {
                 var q  = Math.sqrt(-2*Math.log(p));
                 return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                                                 ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
        }
        // Rational approximation for upper region:
        if (phigh < p) {
                 var q  = Math.sqrt(-2*Math.log(1-p));
                 return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                                                        ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
        }
        // Rational approximation for central region:
        var q = p - 0.5;
        var r = q*q;
        return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
                                 (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
    };

    nerdy.tpdf = function(x, n) {
        return (Math.exp(-(n + 1) * Math.log(1 + x * x / n) / 2) / 
            (Math.sqrt(n) * nerdy.beta(n / 2, 1 / 2)));
    };

    nerdy.tcdf = function(x, n) {
        var cdf = nerdy.betainc(1 / (1 + x * x / n), n / 2, 1 / 2) / 2;
        if (x > 0) {
            cdf = 1 - cdf;
        }
        return cdf;
    };

    /** Module for generating random values
     * @namespace random
     * @memberof nerdy
     */
    var random = function() {
        return Math.random();
    };

    /** Return random number from the uniform distribution
     * @function random
     * @memberof nerdy.random
     * @return {number} A random number from the uniform distribution
     */
    nerdy.random = random;

    /** Return random number from the normal distribution
     * @function normal
     * @memberof nerdy.random
     * @return {number} A random number from the normal distribution
     */
    random.normal = function() {
        var z = random.normal.next;
        random.normal.next = null;
        if (z === null) {
            var a = Math.sqrt(-2 * Math.log(Math.random()));
            var b = Math.random() * 2 * Math.PI;
            z = a * Math.cos(b);
            random.normal.next = a * Math.sin(b);
        }
        return z;
    };
    random.normal.next = null;

    /** Return random number from the log-normal distribution
     * @function lognormal
     * @memberof nerdy.random
     * @return {number} A random number from the log-normal distribution
     */
    random.lognormal = function() {
        return Math.exp(random.normal());
    };

    /** Module for computing distances
     * @namespace distance
     * @memberof nerdy
     */
    var distance = function(a, b) {
        return numeric.norm2(sub(a, b));
    };

    nerdy.distance = distance;

    /** Return the euclidean distance between two vectors
     * @function euclidean
     * @memberof nerdy.distance
     * @param {Array.<number>} a A vector
     * @param {Array.<number>} b Another vector
     * @return {number}
     * @example nerdy.distance.euclidean([0, 0], [1, 1]) == Math.sqrt(2)
     */
    distance.euclidean = nerdy.distance;

    /** Return the manhattan distance between two vectors
     * @function manhattan
     * @memberof nerdy.distance
     * @param {Array.<number>} a A vector
     * @param {Array.<number>} b Another vector
     * @return {number}
     * @example nerdy.distance.manhattan([0, 0], [1, 1]) == 2
     */
    distance.manhattan = function(a, b) {
        return sum(abs(sub(a, b)));
    };

    /** Returns a minkowski distance function of order p
     * @function minkowski
     * @memberof nerdy.distance
     * @param {number} p The order of the distance function
     * @return {function} A function of (a, b) that returns the p-order distance between a and b
     * @example nerdy.distance.minkowski(1) ~= nerdy.distance.manhattan
     * @example nerdy.distance.minkowski(2) ~= nerdy.distance.euclidean
     */
    distance.minkowski = function(p) {
        return function(a, b) {
            return Math.pow(sum(pow(abs(sub(a, b)), p)), 1 / p);
        };
    };

    /** Return the chebyshev distance between two vectors
     * @function chebyshev
     * @memberof nerdy.distance
     * @param {Array.<number>} a A vector
     * @param {Array.<number>} b Another vector
     * @return {number}
     * @example nerdy.distance.chebyshev([0, 0], [1, 1]) == 1
     */
    distance.chebyshev = function(a, b) {
        return nerdy.max(abs(sub(a, b)));
    };

    /** Logistic sigmoid function
     * @function sigmoid
     * @memberof nerdy
     * @param {number} x
     * @return {number}
     * @example nerdy.sigmoid(-1000) ~= 0
     * @example nerdy.sigmoid(0) == 0.5
     * @example nerdy.sigmoid(1000) ~= 1
     */
    nerdy.sigmoid = function(x) {
        return 1.0 / (1.0 + Math.exp(-x));
    };

    /** Logistic sigmoid function gradient
     * @function sigmoidGradient
     * @memberof nerdy
     * @param {number} x
     * @return {number}
     * @example nerdy.sigmoid(0) == 0.25
     */
    nerdy.sigmoidGradient = function(x) {
        x = nerdy.sigmoid(x);
        return x * (1.0 - x);
    };

    /** Pseudo inverse of matrix
     * @function pinv
     * @memberof nerdy
     * @param {Array.<Array.<number>>} matrix The matrix to invert
     * @return {Array.<Array.<number>>}
     * @example nerdy.pinv(nerdy.pinv(matrix)) ~= matrix
     */
    nerdy.pinv = function(matrix, tol) {
        var abs = Math.abs,
            svd = numeric.svd(matrix),
            S = svd.S,
            n = S.length;
        tol = (typeof cutoff == 'undefined' ? 1e-15 : cutoff);
        tol *= Math.max.apply(Math, S);
        for (var i = 0; i < n; i++) {
            S[i] = abs(S[i]) < tol ? 0 : 1 / S[i];
        }
        return dot(dot(svd.V, numeric.diag(S)), transpose(svd.U));
    };

    nerdy.expand = function(vector, order) {
        var out = [],
            types = ['linear', 'quadratic', 'cubic', 'quartic', 'quintic', 'sextic'],
            p = 1 + _.indexOf(types, order),
            m = vector.length,
            polys = vector.map(function() {return 0;}),
            index = 0;
        var term = function() {
            var value = 1;
            for (var i = 0; i < m; i++) {
                value *= Math.pow(vector[i], polys[i]);
            }
            return value;
        };
        out.push(term());
        while (true) {
            if (++polys[index] > p) {
                if (index < m - 1) {
                    polys[index] = 0;
                    index++;
                    continue;
                } else {
                    break;
                }
            } else {
                index = 0;
            }
            out.push(term());
        }
        return out;
    };

    
    /** <div>Minimize a function</div>
    Adapted from <a href="http://learning.eng.cam.ac.uk/carl/code/minimize/minimize.m">this</a>
    octave program written by Carl Edward Rasmussen.
    Has been adapted such that the only parameters are the function returning {cost, gradient)
    , an initial x value, and a maximum number of iterations.
     * @copyright <a href="http://learning.eng.cam.ac.uk/carl/code/minimize/Copyright"> Carl Edward Rasmussen, 2006-04-06 </a>
     * @function minimize
     * @memberof nerdy
     * @param {function(Array): {cost: number, gradient: Array}} f A function of x returning {cost: f(x), gradient: f'(x)}
     * @param {Array} x The initial x vector
     * @param {number} maxIters Maximum number of iterations
     * @return {Array} The resulting x vector
     */
    nerdy.minimize = function(f, X, maxIters) {
        var min = Math.min,
            max = Math.max,
            sqrt = Math.sqrt,
            realmin = Number.MIN_VALUE;
        var EXT = 3.0,     // extrapolate maximum 3 times the current bracket.
            RHO = 0.01,    //constant for Wolfe-Powell conditions
            SIG = 0.5,     //constant for Wolfe-Powell conditions
            INT = 0.1,     // don't reevaluate within 0.1 of the limit of the current bracket
            MAX = 20,      // max 20 function evaluations per line search
            RATIO = 100,   // maximum allowed slope ratio
            M = 0,
            i = 0,         // zero the run length counter
            red = 1,       // starting point
            ls_failed = 0, // no previous line search has failed
            evaled = f(X),
            f1 = evaled.cost,
            df1 = evaled.gradient,
            s = mul(df1, -1),        // search direction is steepest
            d1 = dot(mul(s, -1), s), // this is the slope
            z1 = red / (1.0 - d1),   // initial step is red/(|s|+1)
            z2,
            A,
            B,
            tmp;
        while (i++ < maxIters) {     // while not finished
            // make a copy of current values
            var X0 = X;
            var f0 = f1;
            var df0 = df1;
            // begin line search
            addeq(X, mul(s, z1));
            evaled = f(X);
            var f2 = evaled.cost;
            var df2 = evaled.gradient;
            var d2 = dot(df2, s);
            // initialize point 3 equal to point 1
            var f3 = f1;
            var d3 = d1;
            var z3 = -z1;
            M = MAX;
            // initialize quanteties
            var success = 0;
            var limit = -1;
            while (true) {
                while (((f2 > f1 + z1 * RHO * d1) | (d2 > -SIG * d1)) && (M > 0)) {
                    // tighten the bracket
                    limit = z1;
                    z2 = 0.0;
                    A = 0.0;
                    B = 0.0;
                    if (f2 > f1) {
                        // quadratic fit
                        z2 = z3 - (0.5 * d3 * z3 * z3) / (d3 * z3 + f2 - f3);
                    } else {
                        // cubic fit
                        A = 6 * (f2 - f3) / z3 + 3 * (d2 + d3);
                        B = 3 * (f3 - f2) - z3 * (d3 + 2 * d2);
                        // numerical error possible - ok!
                        z2 = (sqrt(B * B - A * d2 * z3 * z3) - B) / A;
                    }
                    if (isNaN(z2) || !isFinite(z2)) {
                        // if we had a numerical problem then bisect
                        z2 = z3 / 2.0;
                    }
                    // don't accept too close to limits
                    z2 = max(min(z2, INT * z3), (1 - INT) * z3);
                    // update the step
                    z1 = z1 + z2;
                    addeq(X, mul(s, z2));
                    evaled = f(X);
                    f2 = evaled.cost;
                    df2 = evaled.gradient;
                    M = M - 1;
                    d2 = dot(df2, s);
                    // z3 is now relative to the location of z2
                    z3 = z3 - z2;
                }
                if (f2 > f1 + z1 * RHO * d1 || d2 > -SIG * d1) {
                    break; // this is a failure
                } else if (d2 > SIG * d1) {
                    success = 1;
                    break; // success
                } else if (M == 0) {
                    break; // failure
                }
                // make cubic extrapolation
                A = 6 * (f2 - f3) / z3 + 3 * (d2 + d3);
                B = 3 * (f3 - f2) - z3 * (d3 + 2 * d2);
                z2 = -d2 * z3 * z3 / (B + sqrt(B * B - A * d2 * z3 * z3));
                // num prob or wrong sign?
                if (isNaN(z2) || !isFinite(z2) || z2 < 0) {
                    // if we have no upper limit
                    if (limit < -0.5) {
                        // the extrapolate the maximum amount
                        z2 = z1 * (EXT - 1);
                    } else {
                        // otherwise bisect
                        z2 = (limit - z1) / 2;
                    }
                } else if ((limit > -0.5) && (z2 + z1 > limit)) {
                    // extraplation beyond max?
                    z2 = (limit - z1) / 2; // bisect
                } else if ((limit < -0.5) && (z2 + z1 > z1 * EXT)) {
                    // extrapolationbeyond limit
                    z2 = z1 * (EXT - 1.0); // set to extrapolation limit
                } else if (z2 < -z3 * INT) {
                    z2 = -z3 * INT;
                } else if ((limit > -0.5) && (z2 < (limit - z1) * (1.0 - INT))) {
                    // too close to the limit
                    z2 = (limit - z1) * (1.0 - INT);
                }
                // set point 3 equal to point 2
                f3 = f2;
                d3 = d2;
                z3 = -z2;
                z1 = z1 + z2;
                // update current estimates
                addeq(X, mul(s, z2));
                evaled = f(X);
                f2 = evaled.cost;
                df2 = evaled.gradient;
                M = M - 1;
                d2 = dot(df2, s);
            } // end of line search
            if (success == 1) {
                // if line search succeeded
                f1 = f2;
                // Polack-Ribiere direction
                muleq(s, (dot(df2, df2) - dot(df1, df2)) / dot(df1, df1));
                subeq(s, df2);
                tmp = df1;
                df1 = df2;
                df2 = tmp; // swap derivatives
                d2 = dot(df1, s);
                if (d2 > 0) {
                    // new slope must be negative
                    s = mul(df1, -1); // otherwise use steepest direction
                    d2 = dot(mul(s, -1), s);
                }
                // slope ratio but max RATIO
                z1 = z1 * min(RATIO, d1 / (d2 - realmin));
                d1 = d2;
                ls_failed = 0; // this line search did not fail
            } else {
                X = X0;
                f1 = f0;
                df1 = df0; // restore point from before failed line search
                if (ls_failed == 1) {
                    // line search failed twice in a row?
                    break;
                }
                tmp = df1;
                df1 = df2;
                df2 = tmp; // swap derivatives
                s = mul(df1, -1); // try steepest
                d1 = dot(mul(s, -1), s);
                z1 = 1.0 / (1.0 - d1);
                ls_failed = 1; // this line search failed
            }
        }
        return X;
    };

    /** Parse string of delimited data
     * @function parse
     * @memberof nerdy
     * @param {string} text The string to parse
     * @param {string=} delimiter The delimiter (guessed if none is provided)
     * @return {Array} Array of rows
     * @example nerdy.parse('a,b,c\n1,2,3\n') == [['a','b','c'],[1,2,3]]
     * @example nerdy.parse('a|b|c\n1|2|3\n') == [['a','b','c'],[1,2,3]]
     */
    (function() {
        var parse = function(text, delimiter) {
            if (!delimiter) {
                delimiter = nerdy.parse.guessDelimiter(text);
            }
            var lines = nerdy.parse.splitLine(nerdy.parse.normalizeNewlines(text), '\n');
            lines = lines.filter(function(line) {
                return nerdy.parse.trim(line).length > 0;
            });
            return lines.map(function(line) {
                return nerdy.parse.splitLine(line, delimiter);
            });
        };
        nerdy.parse = parse;
        parse.DELIMITERS = [',', '\t', ';', '|', ':'];
        parse.isNumber = function(x) {
            return !isNaN(parseFloat(x)) && isFinite(x);
        };
        parse.isDate = function(x) {
            return !isNaN(Date.parse(x.replace(/-/g, '/')));
        };
        parse.normalizeNewlines = function(text) {
            return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        };
        parse.trim = function(text) {
            return text.replace(/^\s+|\s+$/g, '');
        };
        parse.splitLine = function(line, delimiter) {
            var columns = line.split(delimiter = delimiter || ",");
            for (var foo = columns, x = foo.length - 1, tl; x >= 0; x--) {
                if (foo[x].replace(/"\s+$/, '"').charAt(foo[x].length - 1) == '"') {
                    if ((tl = foo[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
                        foo[x] = foo[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
                    } else if (x) {
                        foo.splice(x - 1, 2, [foo[x - 1], foo[x]].join(delimiter));
                    } else {
                        foo = foo.shift().split(delimiter).concat(foo);
                    }
                } else {
                    foo[x].replace(/""/g, '"');
                }
            }
            return foo.map(parse.trim);
        };
        parse.guessDelimiter = function(text) {
            var stats = [],
                lines = parse.splitLine(parse.normalizeNewlines(text), '\n');
            lines = lines.filter(function(line) {
                return parse.trim(line).length > 0;
            });
            for (var i = 0; i < parse.DELIMITERS.length; i++) {
                var delimiter = parse.DELIMITERS[i];
                var temp = lines.map(function(line) {
                    return parse.splitLine(line, delimiter).length;
                });
                var mean = nerdy.mean(temp);
                stats.push({
                    delimiter: delimiter,
                    mean: mean,
                    sd: nerdy.sd(temp, mean)
                });
            }
            stats.sort(function(a, b) {
                return (b.mean / (1 + b.sd)) - (a.mean / (1 + a.sd));
            });
            return stats[0].delimiter;
        };
        parse.guessType = function(array) {
            if (_.every(array, parse.isNumber)) {
                return 'number';
            } else if (_.every(array, parse.isDate)) {
                return 'date';
            }
            return 'category';
        };
    })();

    /** Dataset, a class for querying and manipulating tabular data
     * @constructor
     * @memberof nerdy
     * @example
// Instantiate a dataset
var data = new nerdy.Dataset();
// Load a dataset from an array (the first row is the header)
data.load([
    ['a', 'b', 'c'],
    [1, 2, 3],
    [4, 5, 0],
    [7, 8, 0]
]);
// Perform a query on the dataset
var query = data.where('a > 4');
// extract an array of the b column from the query
console.log(queue.select('b'));
     */
    var Dataset = new Classy(function(cls) {
        // Constructor for data subset
        cls.method('init', [cls, Array], function(root, keys) {
            this.root = root;
            this.keys = keys;
        });
        // Constructor for root data
        cls.method('init', function() {
            this.root = this;
            this.keys = [];
            this.head = [];
            this.data = [];
        });
        cls.prototype.toJSON = function() {
            var out = [];
            this.each(function(obj) {
                out.push(obj);
            });
            return out;
        };
        /** Load data (overwriting existing data)
         * @function load
         * @memberof nerdy.Dataset
         * @param {Array|string} arg Either an array of [header,rows..] or a string of delimited data
         * @example
// Load data
data.load([
    ['a', 'b', 'c'],
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]);
         * @example
// Load data
data.load('a,b,c\n1,2,3\n4,5,6\n7,8,9');
         */
        cls.method('load', Array, function(array) {
            var root = this.root;
            if (root !== this) {
                throw 'Dataset.load cannot be called on subsets of the data';
            }
            root.head = array[0].slice(0);
            root.data = array.slice(1);
            root.keys = _.range(root.data.length);
            return this;
        });
        // Iterate over each key
        cls.method('eachKey', [Function], function(fn) {
            var keys = this.keys,
                length = keys.length;
            for (var i = 0; i < length; i++) {
                fn(keys[i]);
            }
            return this;
        });
        // Iterate over each row
        cls.method('eachRow', [Function], function(fn) {
            var data = this.root.data;
            return this.eachKey(function(key) {
                fn(data[key]);
            });
        });
        // Iterate over the data (does not change data)
        cls.method('each', [Function], function(fn) {
            var head = this.root.head;
            return this.eachRow(function(row) {
                fn(_.object(head, row));
            });
        });
        /** Return a list of the results of a function on each object in the dataset or query
         * @function select
         * @memberof nerdy.Dataset
         * @param {function|string} arg Function or string to be evaluated on each object
         * @return {Array} Array of results
         * @example
// Create array of columns "a" and "b"
var ab = data.select(function(obj) {
    return [obj.a, obj.b]
});
         * @example
// Create array of columns "a" and "b"
var ab = data.select('[a, b]');
         */
        cls.method('select', [Function], function(fn) {
            var out = [];
            this.each(function(x) {
                out.push(fn(x));
            });
            return out;
        });
        cls.method('select', [String], function(str) {
            var out = [], fn = new Function(this.root.head, 'return ' + str);
            this.eachRow(function(x) {
                out.push(fn.apply(fn, x));
            });
            return out;
        });
        /* XXX */
        cls.method('distinct', [Object], function(arg) {
            return _.unique(this.select(arg));
        });
        /* XXX */
        cls.method('count', [], function() {
            return this.keys.length;
        });
        /* XXX */
        cls.method('mean', [Object], function(arg) {
            return nerdy.mean(this.select(arg));
        });
        /* XXX */
        cls.method('sum', [Object], function(arg) {
            return nerdy.sum(this.select(arg));
        });
        /* XXX */
        cls.method('sd', [Object], function(arg) {
            return nerdy.sd(this.select(arg));
        });
        /* XXX */
        cls.method('variance', [Object], function(arg) {
            return nerdy.variance(this.select(arg));
        });
        /* XXX */
        cls.method('min', [Object], function(arg) {
            return nerdy.min(this.select(arg));
        });
        /* XXX */
        cls.method('max', [Object], function(arg) {
            return nerdy.max(this.select(arg));
        });
        /* XXX */
        cls.method('cov', [Object], function(arg) {
            return nerdy.cov(this.select(arg));
        });
        /* XXX */
        cls.method('cor', [Object], function(arg) {
            return nerdy.cor(this.select(arg));
        });
        /* XXX */
        cls.method('describe', [Object], function(arg) {
            return nerdy.describe(this.select(arg));
        });
        /** Return subset of data based on a condition as a dataset object
         * @function where
         * @memberof nerdy.Dataset
         * @param {function|string} arg Truth test for each object
         * @return {Dataset} A subset of the data
         * @example
// Query for all objects with column "a" > 4
var query = data.where(function(obj) {
    return obj.a > 4;
});
         * @example
// Query for all objects with column "a" > 4
var query = data.where('a > 4');
         */
        cls.method('where', [Function], function(fn) {
            var newkeys = []
                head = this.root.head,
                data = this.root.data;
            this.eachKey(function(key) {
                if (fn(_.object(head, data[key]))) {
                    newkeys.push(key);
                }
            });
            return new Dataset(this.root, newkeys);
        });
        cls.method('where', [String], function(str) {
            var newkeys = []
                head = this.root.head,
                data = this.root.data,
                fn = new Function(head, 'return ' + str);
            this.eachKey(function(key) {
                if (fn.apply(fn, data[key])) {
                    newkeys.push(key);
                }
            });
            return new Dataset(this.root, newkeys);
        });
        /** Update dataset or query
         * @function update
         * @memberof nerdy.Dataset
         * @param {function|string} fn a function to update dataset with.
         * @example
// Set every a to 1
data.update(function(obj) {
    obj.a = 1;
});
         * @example
// Set every a to 1
data.update('a = 1');
         */
        cls.method('update', [Function], function(fn) {
            var length = this.keys.length;
            for (var i = 0; i < length; i++) {
                fn(this.at(i));
            }
            return this;
        });
        cls.method('update', [String], function(str) {
            var fn = new Function('__nerdyxxx',
                'with(__nerdyxxx) {' + str + '}'
            );
            return this.update(fn);
        });
        cls.method('at', [Number], function(i) {
            var proxy = {},
                data = this,
                key = this.keys[i];
            _.each(this.root.head, function(name, column) {
                Object.defineProperty(proxy, name, {
                    get: function() {
                        return data.data[data.keys.indexOf(key)][column];
                    },
                    set: function(value) {
                        data.data[data.keys.indexOf(key)][column] = value;
                    }
                });
            });
            return proxy;
        });
    });
    nerdy.Dataset = Dataset;

    nerdy.featureSet = function(samples, options) {
        var X = samples.select('[' + options.x.join(',') + ']');
        var mean, sd;
        if (options.standardize) {
            var Xt = transpose(X);
            mean = _.map(Xt, nerdy.mean);
            sd = _.map(Xt, nerdy.sd);
            X = _.map(X, function(row) {
                return _.map(row, function(x, i) {
                    return (x - mean[i]) / sd[i];
                });
            });
        }
        if (options.intercept) {
            X = _.map(X, function(row) {
                return [1].concat(row);
            });
        }
        if (options.expansion && options.expansion != 'linear') {
            X = _.map(X, function(row) {
                return nerdy.expand(row, options.expansion);
            });
        }
        return {
            mean: mean,
            sd: sd,
            matrix: X,
            extract: function(obj) {
                var vector = _.map(options.x, function(key) {
                    return obj[key];
                });
                if (options.standardize) {
                    vector = _.map(vector, function(x, i) {
                        return (x - mean[i]) / sd[i];
                    });
                }
                if (options.intercept) {
                    vector = [1].concat(vector);
                }
                if (options.expansion && options.expansion != 'linear') {
                    vector = nerdy.expand(vector, options.expansion);
                }
                return vector;
            }
        }
    }

    global.nerdy = nerdy;
});
