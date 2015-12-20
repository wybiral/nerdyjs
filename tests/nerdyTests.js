function nerdyTests(tests) {

    function assert(unit, expr) {
        var abs = Math.abs,
            eq = function(a, b) {return abs(a - b) < 0.0001};
        unit.assert(eval(expr)).title(expr);
    }

    tests.group('nerdy', function(module) {
        module.unit('Aggregate functions', function(unit) {
            assert(unit, 'nerdy.sum([]) == 0');
            assert(unit, 'nerdy.sum([1, 2, 3]) == 6');
            assert(unit, 'nerdy.sum([-1, 1]) == 0');

            assert(unit, 'nerdy.ss([]) == 0');
            assert(unit, 'nerdy.ss([1, 2, 3]) == 14');
            assert(unit, 'nerdy.ss([-1, 1]) == 2');

            assert(unit, 'isNaN(nerdy.mean([]))');
            assert(unit, 'nerdy.mean([1, 2, 3]) == 2');
            assert(unit, 'nerdy.mean([-1, 1]) == 0');

            assert(unit, 'nerdy.variance([]) == 0');
            assert(unit, 'nerdy.variance([1, 2, 3]) == 1');
            assert(unit, 'nerdy.variance([1, 2, 3], 2) == 1');
            assert(unit, 'nerdy.variance([1, 2, 3], 3) == 2.5');
            assert(unit, 'nerdy.variance([-1, 1]) == 2');

            assert(unit, 'nerdy.sd([]) == 0');
            assert(unit, 'nerdy.sd([1, 2, 3]) == 1');
            assert(unit, 'nerdy.sd([1, 2, 3], 2) == 1');
            assert(unit, 'nerdy.sd([1, 2, 3], 3) == Math.sqrt(2.5)');
            assert(unit, 'nerdy.sd([-1, 1]) == Math.sqrt(2)');

            assert(unit, 'nerdy.min([]) == Infinity');
            assert(unit, 'nerdy.min([1, 2, 3]) == 1');
            assert(unit, 'nerdy.min([-1, 1]) == -1');

            assert(unit, 'nerdy.max([]) == -Infinity');
            assert(unit, 'nerdy.max([1, 2, 3]) == 3');
            assert(unit, 'nerdy.max([-1, 1]) == 1');

            assert(unit, 'isNaN(nerdy.median([]))');
            assert(unit, 'nerdy.median([1, 2, 3]) == 2');
            assert(unit, 'nerdy.median([-1, 1]) == 0');
            assert(unit, 'nerdy.median([1, 2, 3, 4]) == 2.5');

            assert(unit, 'nerdy.skew([1, 2, 3]) == 0');
            assert(unit, 'eq(nerdy.skew([1, 2, 4]), 0.9352)');

            assert(unit, 'eq(nerdy.kurt([1, 2, 3, 4]), -1.2)');

            assert(unit, 'nerdy.cov([1, 2, 3], [1, 2, 3]) == 1');
            assert(unit, 'nerdy.cov([1, 2, 3], [-1, -2, -3]) == -1');
            assert(unit, 'isNaN(nerdy.cov([], []))');

            assert(unit, 'nerdy.cor([1, 2, 3], [1, 2, 3]) == 1');
            assert(unit, 'nerdy.cor([1, 2, 3], [-1, -2, -3]) == -1');
            assert(unit, 'isNaN(nerdy.cor([], []))');
        });

        module.unit('Functions', function(unit) {
            assert(unit, 'eq(nerdy.lgamma(4), 1.791759)');
            assert(unit, 'eq(nerdy.lgamma(5), 3.178054)');

            assert(unit, 'eq(nerdy.gamma(3), 2)');
            assert(unit, 'eq(nerdy.gamma(6), 120)');

            assert(unit, 'eq(nerdy.beta(6, 2), 0.023810)');
            assert(unit, 'eq(nerdy.beta(1, 3),  0.33333)');
            assert(unit, 'eq(nerdy.beta(2, 10), 0.0090909)');
        });

        module.unit('Distributions', function(unit) {
            assert(unit, 'eq(nerdy.betapdf(0.1, 2, 3), 0.972)');
            assert(unit, 'eq(nerdy.betapdf(0.5, 1000, 1000), 35.678)');

            assert(unit, 'eq(nerdy.betacdf(0.5, 1, 2), 0.75)');
            assert(unit, 'eq(nerdy.betacdf(0.25, 100, 300), 0.50768)');

            assert(unit, 'eq(nerdy.fpdf(0.1, 1, 1), 0.915)');
            assert(unit, 'eq(nerdy.fpdf(0.05, 1, 2), 1.5236)');
            assert(unit, 'eq(nerdy.fpdf(0.05, 2, 1), 0.86678)');

            assert(unit, 'eq(nerdy.fcdf(0.5, 1, 2), 0.44721)');
            assert(unit, 'eq(nerdy.fcdf(0.1, 5, 2), 0.017889)');
            assert(unit, 'eq(nerdy.fcdf(0.8, 100, 200), 0.10566)');

            assert(unit, 'eq(nerdy.normpdf(0), 0.39894)');
            assert(unit, 'eq(nerdy.normpdf(0, 1, 1), 0.24197)');
            assert(unit, 'eq(nerdy.normpdf(0, 1, 2), 0.17603)');

            assert(unit, 'eq(nerdy.normcdf(0), 0.50000)');
            assert(unit, 'eq(nerdy.normcdf(0, 1, 1), 0.15866)');
            assert(unit, 'eq(nerdy.normcdf(0, 1, 2), 0.30854)');

            assert(unit, 'eq(nerdy.norminv(0.1), -1.2816)');
            assert(unit, 'eq(nerdy.norminv(0.5), 0)');
            assert(unit, 'eq(nerdy.norminv(0.7), 0.52440)');

            assert(unit, 'eq(nerdy.tpdf(0.2, 1), 0.30607)');
            assert(unit, 'eq(nerdy.tpdf(0.3, 123), 0.38048)');

            assert(unit, 'eq(nerdy.tcdf(0.5, 1), 0.64758)');
            assert(unit, 'eq(nerdy.tcdf(0.2, 100), 0.57906)');
        });

    });
}
