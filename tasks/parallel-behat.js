
'use strict';

var glob = require('glob'),
    _ = require('underscore'),
    ParallelExec = require('./lib/ParallelExec'),
    BehatTask = require('./lib/BehatTask'),
    defaults = {
        src: './**/*.feature',
        bin: './bin/behat',
        cwd: './',
        config: './behat.yml',
        flags: '',
        maxProcesses: 10000,
        baseDir: './',
        debug: false,
        numRetries: 0,
        timeout: 600000
    };

/**
 * Grunt task for executing behat feature files in parallel
 *
 * @param {Grunt} grunt
 */
function GruntTask (grunt) {

    grunt.registerMultiTask('behat', 'Parallel behat', function () {
        var done = this.async(),
            options = this.options(defaults),
            executor = new ParallelExec(options.maxProcesses, {cwd: options.cwd, timeout: options.timeout}),
            behat;

        options.files = this.filesSrc;
        options.done = done;
        options.executor = executor;
        options.log = grunt.log.writeln;

        behat = new BehatTask(options);
        behat.run();
    });

}

module.exports = GruntTask;
