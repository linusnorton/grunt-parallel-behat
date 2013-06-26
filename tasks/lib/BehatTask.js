'use strict';

var _ = require('underscore');

module.exports = function (options) {
    var tasks = {};

    /**
     * Create a behat command for each file and run it using the executor
     */
    function run() {
        _.each(options.files, addTask);

        options.executor.on('startedTask', taskStarted);
        options.executor.on('finishedTask', taskFinished);
        options.executor.run();
    }

    /**
     * Send an individual feature file to be run
     *
     * @param {String} file
     */
    function addTask (file) {
        var configOpt = options.config ? '-c ' + options.config : '',
            filePath = options.baseDir ? + options.baseDir + file : file,
            cmd = [options.bin, configOpt, options.flags, filePath].join(' ');

        tasks[cmd] = file;
        options.executor.addTask(cmd);
    }

    /**
     * Tell the user we've started a new task
     *
     * @param  {string} task
     */
    function taskStarted (task) {
        options.log('Started: ' + tasks[task]);
    }

    /**
     * Tell the user we've finished another task
     *
     * @param  {string} task
     */
    function taskFinished (task) {
        options.log('Finished: ' + tasks[task]);
    }

    this.run = run;

    return this;
}