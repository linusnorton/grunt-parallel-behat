
'use strict';

var glob = require('glob'),
    _ = require('underscore'),
    exec = require('child_process').exec,
    defaults = {
        src: './**/*.feature',
        bin: './bin/behat',
        cwd: './',
        config: './behat.yml',
        flags: '',
        maxProcesses: 10000,
        baseDir: './'
    };

module.exports = function(grunt) {
    var options = _.defaults(grunt.config('behat'), defaults),
        startTime = +new Date(),
        queue = [],
        completed = 0,
        processes = 0,
        total,
        done;

    function runFiles (err, files) {
        total = files.length;
        queue = files;

        grunt.log.writeln('Found ' + total + ' feature file(s). Running ' + options.maxProcesses + ' at a time: ');

        // try to run them all
        files.forEach(runFile);
    }

    function runFile (file) {
        if (processes < options.maxProcesses) {
            queue.splice(queue.indexOf(file), 1);
            runBehat(file);
        }
    }

    function next () {
        runFile(queue[0]);
    }

    function runBehat (file) {
        var cmd = [options.bin, '-c', options.config, options.flags, options.baseDir + file].join(' ');
        grunt.log.writeln('Started ' + (++processes + completed) + ' of ' + total + ': ' + file );

        exec(cmd, {cwd: options.cwd}, _.partial(processResults, file));
    }

    function processResults (file, err, stdout, stderr) {
        var output = stdout.split('\n');

        processes--;

        if (err && err.code === 13) {
            grunt.log.writeln('Timeout: ' + file + ' adding to the back of the queue.');

            queue.push(file);
            next();

            return;
        }
        else if (err && err.code === 1) {
            grunt.log.writeln('Failed: ' + file + ' - ' + output[output.length - 4] + ' in ' + output[output.length - 2]);
        }
        else if (err) {
            grunt.log.writeln('Failed: ' + file + ' with error code ' + err.code + '\n' + err + stdout);
        }
        else {
            grunt.log.writeln('Completed: ' + file + ' - ' + output[output.length - 4] + ' in ' + output[output.length - 2]);
        }

        completed++;

        if (queue.length === 0) {
            finish();
        }
        else {
            next();
        }
    }

    function finish () {
        var finishTime = +new Date(),
            totalTime = finishTime - startTime;

        grunt.log.writeln('\nFinished in ' + Math.floor(totalTime / 60) + 'm' + totalTime % 60 + 's');
        done();
    }

    grunt.registerTask('behat', 'Parallel behat', function () {
        done = this.async();

        glob(options.src, runFiles);
    });

};