Classy.module(function(global) {

    var Task = new Classy(function(cls) {

        cls.property('fn', Function);
        cls.property('status', String);

        cls.method('init', [Function], function(fn) {
            this.fn = fn;
            this.error = null;
            this.status = 'new';
        });

        cls.method('start', function() {
            var task = this;
            if (this.status == 'working' || this.status == 'error') {
                return;
            }
            this.status = 'working';
            try {
                this.fn(function() {
                    task.status = 'done';
                });
            } catch (e) {
                this.error = e;
                this.status = 'error';
            }
        });

    });


    var Tasks = new Classy(function(cls) {
        /*
            An asynchronous task manager. Useful for things like asset loading
            or ensuring that a list of asynchronous tasks gets completed before
            doing something else.

            var completed = 0,
                tasks = new Tasks();

            tasks.add(function(done) {
                completed += 1;
                done();
            });

            tasks.add(function(done) {
                setTimeout(function() {
                    completed += 1;
                    done();
                }, 1000);
            });

            tasks.start(function() {
                console.log(completed);
            });
        */

        cls.method('init', function() {
            this.tasks = [];
            this.started = false;
        });

        cls.method('add', [Function], function(fn) {
            var task = new Task(fn);
            this.tasks.push(task);
            return task;
        });

        cls.method('broadcast', function() {
            _.each(this.tasks, function(task) {
                if (task.status == 'new') {
                    task.start()
                }
            });
        });

        cls.method('start', function() {
            var self = this,
                tasks = this.tasks;
            this.broadcast();
            if (this.started) {
                return;
            }
            this.started = true;
            this.trigger('start');
            (function loop() {
                var groups = _.groupBy(tasks, 'status');
                var done = groups.done || [];
                if (groups.error) {
                    self.trigger('error');
                    return;
                }
                self.trigger('progress', done.length / tasks.length);
                if (done.length < tasks.length) {
                    setTimeout(loop, 100);
                } else {
                    self.trigger('ready');
                }
            })();
        });

        cls.method('start', [Function], function(callback) {
            this.on('ready', callback);
            this.start();
        });

    });

    global.Tasks = Tasks;

});
