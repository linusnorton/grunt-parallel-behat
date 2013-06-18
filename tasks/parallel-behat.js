
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
        queue = [],
        completed = 0,
        processes = 0,
        total,
        done;

    function runFiles (err, files) {
        if (err) throw err;

        total = files.length;
        queue = files;

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
        grunt.log.writeln('Running ' + (++processes + completed) + ' of ' + total + ': ' + cmd);

        exec(cmd, {cwd: options.cwd}, _.partial(processResults, file));
    }

    function processResults (file, err, stdout, stderr) {
        completed++;
        processes--;

        //if (err) throw err;

        if (stderr) {
            grunt.log.writeln(stderr);
        }
        else {
            grunt.log.writeln('Test passed: ' + file);
        }

        if (queue.length === 0) {
            done();
        }
        else {
            next();
        }
    }

    grunt.registerTask('behat', 'Parallel behat', function () {
        done = this.async();

        glob(options.src, runFiles);
    });

};