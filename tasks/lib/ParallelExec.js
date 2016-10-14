var exec = require('child_process').exec,
    _ = require('underscore'),
    EventEmitter = require('events').EventEmitter;

/**
 * Run some commands in parallel
 *
 * @param {Number} maxTasks
 * @param {Object} execOptions
 */
function ParallelExec (maxTasks, execOptions) {
    var running = false,
        queue = [],
        runningTasks = 0,
        usedPorts = {};

    /**
     * True if there are items on the queue and we have space to run a task
     *
     * @return {boolean}
     */
    function canStartTask () {
        var usedPorts_length = Object.keys(usedPorts).length;
        return queue.length > 0 && running && runningTasks < maxTasks && usedPorts_length < maxTasks && (typeof execOptions.ports == 'undefined' || usedPorts_length < execOptions.ports.length);
    }

    /**
     * Adds a task to the queue and starts the next task if there is space.
     *
     * @param {string} cmd
     */
    function addTask (cmd) {
        queue.push(cmd);

        if (canStartTask()) {
            startNextTask();
        }
    }

    /**
     * Shift the next task from the queue and start it up
     */
    function startNextTask () {
        if (canStartTask()) {
            var cmd = queue.shift();

            runningTasks++;
            this.emit('startedTask', cmd);

            // Retrieve the behat parameters.
            var behat_params = JSON.parse(execOptions.env['BEHAT_PARAMS']);

            if (typeof execOptions.ports != 'undefined') {
              // Multiple ports have been specified in Gruntconfig.json. We
              // will extend the behat environment variable to specify the port
              // to use for this run.

              var getPort = function (a, b) {
                var availablePorts = a.filter(function (port) {
                  return b.indexOf(port) == -1;
                });
                return availablePorts[0];
              };
              var port = getPort(execOptions.ports, Object.keys(usedPorts).map(function (key) { return usedPorts[key]; }));

              // Now add the available port to the behat parameters, assuming
              // that zombiejs is used.
              behat_params.extensions['Behat\\MinkExtension'].zombie.port = port;
              execOptions.env['BEHAT_PARAMS'] = JSON.stringify(behat_params);
              usedPorts[cmd] = port;
            }

            exec(cmd, execOptions, _.partial(taskDone, cmd));
        }
    }

    /**
     * Decrement the running tasks and start the next one
     */
    function taskDone (cmd, err, stdout, stderr) {
        runningTasks--;
        if (typeof usedPorts[cmd] != 'undefined') {
          delete usedPorts[cmd];
        }
        this.emit('finishedTask', cmd, err, stdout, stderr);

        if (canStartTask()) {
            startNextTask();
        }
        else if (runningTasks === 0) {
            this.emit('finished');
        }
    }

    /**
     * Start the tasks running
     */
    function start () {
        running = true;

        _.times(maxTasks - runningTasks, startNextTask);
    }

    startNextTask = startNextTask.bind(this);
    taskDone = taskDone.bind(this);

    this.start = start;
    this.addTask = addTask;

    // inherit from event emitter
    EventEmitter.call(this);
}

require('util').inherits(ParallelExec, EventEmitter);

module.exports = ParallelExec;
