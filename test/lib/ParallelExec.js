'use strict';

var assert = require('chai').assert,
    spy = require('sinon').spy,
    stub = require('sinon').stub,
    ParallelExec = require('../../tasks/lib/ParallelExec');

suite('Parallel exec', function () {
    var executor;

    test('add task does not start the next task if it is not running', function () {
        executor = new ParallelExec(5);
        executor.emit = spy();
        executor.addTask('win');

        assert.equal(executor.emit.callCount, 0);
    });

    test('add task does start the next task if it is running', function (done) {
        executor = new ParallelExec(5);
        executor.on('startedTask', function () {
            done();
        });

        executor.start();
        executor.addTask('win');
    });

    test('should start the next task after one completes', function (done) {
        var callCount = 0;

        executor = new ParallelExec(1);
        executor.on('startedTask', function () {
            if (++callCount === 2) {
                done();
            }
        });

        executor.addTask('win');
        executor.addTask('ner');
        executor.start();
    });    

    test('should emit finished when the queue is empty', function (done) {
        executor = new ParallelExec(1);
        executor.on('finished', function () {
            done();        
        });

        executor.addTask('win');
        executor.addTask('ner');
        executor.start();
    });    

});