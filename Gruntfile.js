'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= mochaTest.test.src %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          ui: 'tdd'
        },
        src: ['test/**/*.js']
      },
      testCoverage: {
        options: {
          reporter: 'spec',
          require: 'coverage',
          ui: 'tdd'
        },
        src: ['test/**/*.js']
      },
      coverageReport: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          ui: 'tdd'
        },
        src: ['test/**/*.js'],
        dest: 'coverage.html'
      }
    },

    behat: {
        maxProcesses: 5,
        flags: '--tags @wip'
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', 'mochaTest:test');
  grunt.registerTask('coverage', ['mochaTest:testCoverage', 'mochaTest:coverageReport']);
  grunt.registerTask('lint', 'jshint');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['lint', 'test']);

};