'use strict';

var _ = require('underscore'),
    inspect = require('util').inspect,
    parseString = require('xml2js').parseString,
    fs = require('fs');

/**
 * Run multiple behat feature files in parallel.
 *
 * Example usage:
 *
 * var behat = new BehatTask({
 *     files: ['feature1.feature', 'feature2.feature'],
 *     log: console.log,
 *     bin: 'behat',
 *     flags: '--tags @wip',
 *     executor: new ParallelExec(5),
 *     numRetries: 0
 * })
 *
 * @param {Object} options
 */
function BehatTask (options) {
    var tasks = {},
        failedTasks = {},
        startTime;

    /**
     * Create a behat command for each file and run it using the executor
     */
    function run() {
        startTime = +new Date();

        _.each(options.files, addTask);
        options.log.subhead('Running ' + options.maxProcesses + ' at a time.');

        options.executor.on('startedTask', taskStarted);
        options.executor.on('finishedTask', taskFinished);
        options.executor.on('finished', finish);
        options.executor.start();
    }

    /**
     * Send an individual feature file to be run
     *
     * @param {String} file
     */
    function addTask (file) {
        if (fs.lstatSync(file).isFile() && file.indexOf('.feature') > -1) {
            var configOpt = options.config ? '-c ' + options.config : '',
                filePath = options.baseDir ? options.baseDir + file : file,
                junitOut = options.junit ? '-f junit --out ' + options.junit.output_folder : '',
                cmd = [options.bin, configOpt, filePath, options.flags, junitOut].join(' ');

            // Consistent spaces and trimming space off end
            cmd = cmd.replace(/\s+/g, ' ').trim();
            tasks[cmd] = file;
            options.executor.addTask(cmd);
        }
    }

    /**
     * Tell the user we've started a new task
     *
     * @param  {string} task
     */
    function taskStarted (task) {
        options.log.writeln('Started: ' + task);
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
        var file = tasks[task];

        // Capture junit output
        if (options.junit) {
            var file_path = file.split('/');
            var feature = file_path[file_path.length - 1].replace('.feature', '');
            file_path.splice(-1, 1);
            for (var i = 0; i < file_path.length; i++) {
                if (file_path[i] == 'features') {
                    file_path.splice(0, i + 1);
                }
            }
            var testfile = fs.readFileSync(options.junit.output_folder + feature + '.xml', 'utf8');
            if (testfile) {
                parseString(testfile, function (err, result) {

                    if (err) {
                        options.log.error('Failed: to read JUnit XML file');
                        taskPendingOrFailed(task);
                    }
                    else if ((result.testsuites.testsuite["0"].$.errors && result.testsuites.testsuite["0"].$.errors >= 1) || (result.testsuites.testsuite["0"].$.failures && result.testsuites.testsuite["0"].$.failures >= 1)) {
                        for (var i = 0; i < result.testsuites.testsuite.length; i++) {
                            if (result.testsuites.testsuite[i].$.failures) {
                                options.log.error('Error: ' + file + ' - ' + result.testsuites.testsuite[i].$.failures + ' total errors');
                                } else {
                                options.log.error('Error: ' + file);
                                }
                                // Capture normal message or runtime error as a fallback
                                taskPendingOrFailed(task);
                            }
                        }
                    else {
                        options.log.ok('Completed: ' + file + ' - ' + result.testsuites.$.name);

                    }
                });
            } else {
                options.log.error('Failed: to read JUnit XML file');
            }

        } else {
            var output = stdout ? stdout.split('\n') : [];

            if (options.debug) {
                if (err) options.log.writeln('\nerr: \n' + inspect(err));
                if (stderr) options.log.writeln('\nstderr: \n' + stderr);
                if (stdout) options.log.writeln('\nstdout: \n' + stdout);
            }

            if (err && (err.code === 13 || err.killed)) {
                options.log.writeln('Timeout: ' + file + ' - adding to the back of the queue.');
                options.executor.addTask(task);
            }
            else if (err && err.code === 1) {
                options.log.error('Failed: ' + file + ' - ' + output[output.length - 4] + ' in ' + output[output.length - 2]);
                taskPendingOrFailed(task);
            }
            else if (err) {
                options.log.error('Error: ' + file + ' - ' + err + stdout);
            }
            else {
                options.log.ok('Completed: ' + file + ' - ' + output[output.length - 4] + ' in ' + output[output.length - 2]);

                if (output[output.length - 4].indexOf('pending') > -1) {
                    taskPendingOrFailed(task);
                }
            }
        }
    }

    /**
     * Add the given task to the fail list and retry if options.numRetries is specified
     *
     * @param  {string} task
     */
    function taskPendingOrFailed (task) {
        failedTasks[task] = _.has(failedTasks, task) ? failedTasks[task] + 1 : 0;

        if (failedTasks[task] < options.numRetries) {
            options.log.writeln('Retrying: ' + tasks[task] + ' ' + (failedTasks[task] + 1) + ' of ' + options.numRetries + ' time(s)');
            options.executor.addTask(task);
        }
        else {
            options.fail.warn('Scenario failed');
        }
    }

    /**
     * Output the final run time and emit the finished event
     */
    function finish () {
        var totalTime = Math.floor((new Date() - startTime) / 1000);

        options.log.writeln('\nFinished in ' + Math.floor(totalTime / 60) + 'm' + totalTime % 60 + 's');
        options.done();
    }

    this.run = run;
}

module.exports = BehatTask;
