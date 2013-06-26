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
            flags: ''
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

    test('provides user feedback when a task starts and ends', function () {
        stub(mockExecutor, 'run', function () {
            mockExecutor.callbacks.startedTask.call(task, 'behat   awesome.feature');
            mockExecutor.callbacks.finishedTask.call(task, 'behat   awesome.feature');
        });

        task.run();

        assert.equal(log.callCount, 2);
        assert.equal(log.args[0][0], 'Started: awesome.feature');
        assert.equal(log.args[1][0], 'Finished: awesome.feature');
    });


});