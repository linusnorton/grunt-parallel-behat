'use strict';

var assert = require('chai').assert,
    spy = require('sinon').spy,
    stub = require('sinon').stub,
    ParallelExec = require('../../tasks/lib/ParallelExec');

suite('Parallel exec', function () {
    var executor;

    test('Constructor does not throw', function () {
        executor = new ParallelExec(5);
    });
});