'use strict';

var assert = require('chai').assert,
    spy = require('sinon').spy,
    stub = require('sinon').stub,
    BehatTask = require('../../tasks/lib/BehatTask');

suite('Behat Test', function () {
    var mockExecutor,
        task,
        log;

    setup(function () {
        mockExecutor = {
            callbacks: {},
            addTask: spy(),
            run: function () {},
            on: function (event, callback) {
                this.callbacks[event] = callback;
            }
        };

        log = spy();

        task = new BehatTask({
            executor: mockExecutor,
            log: log,
            files: ['awesome.feature', 'brilliant.feature'],
            bin: 'behat',
            flags: '',
            maxProcesses: 10000
        });
    });

    test('adds tasks and starts the executor', function () {
        mockExecutor.run = spy();
        task.run();

        assert.equal(mockExecutor.addTask.callCount, 2);
        assert.equal(mockExecutor.addTask.args[0][0], 'behat   awesome.feature');
        assert.equal(mockExecutor.addTask.args[1][0], 'behat   brilliant.feature');
        assert.equal(mockExecutor.run.callCount, 1);
    });

    test('registers listeners for tasks started and completed', function () {
        mockExecutor.on = spy();
        task.run();

        assert.equal(mockExecutor.on.callCount, 2);
        assert.equal(mockExecutor.on.args[0][0], 'startedTask');
        assert.equal(mockExecutor.on.args[1][0], 'finishedTask');
    });

    test('provides user feedback', function () {
        stub(mockExecutor, 'run', function () {
            mockExecutor.callbacks.startedTask.call(task, 'behat   awesome.feature');
            mockExecutor.callbacks.finishedTask.call(task, 'behat   awesome.feature', void 0, '3 scenarios (3 passed)\n\n5m15s\n');
        });

        mockExecutor.isFinished = stub().returns(true);
        task.run();

        assert.equal(log.callCount, 4);
        assert.equal(log.args[0][0], 'Found 2 feature file(s). Running 10000 at a time.');
        assert.equal(log.args[1][0], 'Started: awesome.feature');
        assert.equal(log.args[2][0], 'Completed: awesome.feature - 3 scenarios (3 passed) in 5m15s');
        assert(log.args[3][0].indexOf('Finished in') > -1);
    });

    test('handles timeouts', function () {
        stub(mockExecutor, 'run', function () {
            mockExecutor.callbacks.finishedTask.call(task, 'behat   awesome.feature', {code: 13}, '');
        });

        mockExecutor.isFinished = stub().returns(false);
        task.run();

        assert.equal(log.callCount, 2);
        assert.equal(mockExecutor.addTask.callCount, 3);        
        assert.equal(log.args[1][0], 'Timeout: awesome.feature - adding to the back of the queue.');
    });

    test('handles failed tests', function () {
        stub(mockExecutor, 'run', function () {
            mockExecutor.callbacks.finishedTask.call(task, 'behat   awesome.feature', {code: 1}, '3 scenarios (1 passed, 2 failed)\n\n5m15s\n');
        });

        mockExecutor.isFinished = stub().returns(false);
        task.run();

        assert.equal(log.callCount, 2);
        assert.equal(log.args[1][0], 'Failed: awesome.feature - 3 scenarios (1 passed, 2 failed) in 5m15s');
    });

    test('handles unknown errors', function () {
        stub(mockExecutor, 'run', function () {
            mockExecutor.callbacks.finishedTask.call(task, 'behat   awesome.feature', {code: 1000000}, 'ZOMG! I\'m dead!!');
        });

        mockExecutor.isFinished = stub().returns(false);
        task.run();

        assert.equal(log.callCount, 2);
        assert.equal(log.args[1][0], 'Error: awesome.feature - [object Object]ZOMG! I\'m dead!!');
    });

});