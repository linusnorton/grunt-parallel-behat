'use strict';

var assert = require('chai').assert,
    grunt = require('grunt'),
    path = '../tasks/parallel-behat';

suite('Grunt task', function () {
    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(path);
        });
    });

    test('require returns function', function () {
        assert.isFunction(require(path));
    });
});