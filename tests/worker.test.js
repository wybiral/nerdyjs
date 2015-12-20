importScripts('../libs/underscore.js');
importScripts('../libs/numeric.js');
importScripts('../libs/classy.js');
importScripts('../libs/tasks.js');
importScripts('test.js');
importScripts('../nerdy.min.js');
importScripts('nerdyTests.js');

var tests = new Tests('Nerdy in web worker');

nerdyTests(tests);

tests.start(function(results) {
    self.postMessage(results);
});

