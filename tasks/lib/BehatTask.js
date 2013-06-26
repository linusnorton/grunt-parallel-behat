'use strict';

var _ = require('underscore');

module.exports = function (options) {
    var tasks = {},
        startTime;

    /**
     * Create a behat command for each file and run it using the executor
     */
    function run() {
        startTime = +new Date();
        options.log('Found ' + options.files.length + ' feature file(s). Running ' + options.maxProcesses + ' at a time.');

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
     * Process the result of the task
     *
     * @param {string} task
     * @param {Object} err
     * @param {string} stdout
     * @param {string} stderr
     */
    function taskFinished (task, err, stdout, stderr) {
        var file = tasks[task],
            output = stdout.split('\n');

        if (err && err.code === 13) {
            options.log('Timeout: ' + file + ' - adding to the back of the queue.');
            options.executor.addTask(task);
        }
        else if (err && err.code === 1) {
            options.log('Failed: ' + file + ' - ' + output[output.length - 4] + ' in ' + output[output.length - 2]);            
        }
        else if (err) {
            options.log('Error: ' + file + ' - ' + err + stdout);
        }
        else {
            options.log('Completed: ' + file + ' - ' + output[output.length - 4] + ' in ' + output[output.length - 2]);        
        }

        if (options.executor.isFinished()) {
            finish();
        }
    }

    /**
     * Output the final run time and emit the finished event
     */
    function finish () {
        var totalTime = new Date() - startTime;

        options.log('\nFinished in' + Math.floor(totalTime / 60) + 'm' + totalTime % 60 + 's');
    }

    this.run = run;

    return this;
}