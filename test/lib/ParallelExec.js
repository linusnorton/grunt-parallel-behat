'use strict';

var assert = require('chai').assert,
    horaa = require('horaa'),
    spy = require('sinon').spy,
    stub = require('sinon').stub,
    ParallelExec = require('../../tasks/lib/ParallelExec');

suite('Parallel exec', function () {
    var executor,
        execHoraa,
        execSpy;

    setup(function () {
        execSpy = spy();
        execHoraa = horaa('child_process');
        execHoraa.hijack('exec', spy());
    });

    test('add task does not start the next task if it is not running', function () {
        executor = new ParallelExec(5);
        executor.addTask('win');

        assert.equal(execSpy.callCount, 0);
    });

    test('add task does start the next task if it is running', function () {
        executor = new ParallelExec(5);
        executor.start();
        executor.addTask('win');

        assert.equal(execSpy.callCount, 0);
    });

});