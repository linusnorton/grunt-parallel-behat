
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
        timeout: 600000,
        env: null
    };

/**
 * Grunt task for executing behat feature files in parallel
 *
 * @param {Grunt} grunt
 */
function GruntTask (grunt) {

    grunt.registerMultiTask('behat', 'Parallel behat', function () {

        // No files found
        if (this.filesSrc.length > 0) {
            var done = this.async(),
                options = this.options(defaults),
                executor = new ParallelExec(options.maxProcesses, {cwd: options.cwd, timeout: options.timeout, env: options.env}),
                behat;

            options.files = this.filesSrc;
            options.done = done;
            options.executor = executor;
            options.log = grunt.log;
            options.fail = grunt.fail;

            behat = new BehatTask(options);
            behat.run();
        } else {
            grunt.fail.errorcount= +1;
            grunt.fail.warn('Unable to find files in location ' + grunt.task.current.data);

        }
    });

}

module.exports = GruntTask;
