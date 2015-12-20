var Test = new Classy(function(cls) {

    cls.method('init', [String], function(title) {
        this._title = title;
        this._status = 'unknown';
    });

    cls.method('init', [], function() {
        this.init('Untitled');
    });

    cls.method('title', [], function() {
        return this._title;
    });
    cls.method('title', [String], function(title) {
        this._title = title;
        return this;
    });

    cls.method('status', [], function() {
        return this._status;
    });
    cls.method('status', [String], function(status) {
        this._status = status;
        return this;
    });

});

var Unit = new Classy(function(cls) {
    cls.method('init', [String, Tasks], function(name, tasks) {
        this.name = name;
        this.tests = [];
        this.tasks = tasks;
    });

    cls.method('assert', [Boolean], function(truth) {
        var test = new Test().title('Assertion');
        test.status(truth ? 'pass' : 'fail');
        this.tests.push(test);
        return test;
    });

    cls.method('throws', [Function], function(fn) {
        var test = new Test().title('Throws');
        try {
            fn();
            test.status('fail');
        } catch (e) {
            test.status('pass');
        }
        this.tests.push(test);
        return test;
    });

    cls.method('async', [Function], function(fn) {
        this.tasks.add(function(done) {
            fn(done);
        }).start();
    });

});


var Tests = new Classy(function(cls) {

    cls.method('init', [String], function(name) {
        this.name = name;
        this.units = [];
        this.groups = [];
        this.tasks = new Tasks();
    });

    cls.method('init', [String, Tasks], function(name, tasks) {
        this.name = name;
        this.units = [];
        this.groups = [];
        this.tasks = tasks;
    });

    cls.method('unit', [String, Function], function(name, body) {
        var unit = new Unit(name, this.tasks);
        this.units.push(unit);
        body(unit);
        return unit;
    });

    cls.method('group', [String, Function], function(name, body) {
        var group = new Tests(name, this.tasks);
        this.groups.push(group);
        body(group);
        return group;
    });

    cls.method('start', [], function() {
        var self = this;
        this.tasks.start(function() {
            self.trigger('ready', self.results());
        });
    });

    cls.method('start', [Function], function(callback) {
        this.on('ready', callback);
        this.start();
    });

    cls.method('results', [], function() {
        var group = {
                name: this.name,
                units: [],
                groups: [],
                status: 'pass'
            };
        _.each(this.units, function(u) {
            var unit = {name: u.name, status: 'pass', tests: []};
            _.each(u.tests, function(t) {
                var test = {name: t.title(), status: t.status()};
                if (test.status != 'pass') {
                    unit.status = 'fail';
                }
                unit.tests.push(test);
            });
            group.units.push(unit);
        });
        _.each(this.groups, function(g) {
            var results = g.results();
            if (results.status != 'pass') {
                group.status = 'fail';
            }
            group.groups.push(results);
        });
        return group;
    });

});

