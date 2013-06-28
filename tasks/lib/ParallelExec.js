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
        runningTasks = 0;

    /**
     * Adds a task to the queue and starts the next task if there is space.
     *
     * @param {string} cmd
     */
    function addTask (cmd) {
        queue.push(cmd);

        if (running && runningTasks < maxTasks) {
            startNextTask();
        }
    }

    /**
     * Shift the next task from the queue and start it up
     */
    function startNextTask () {
        if (queue.length > 0) {
            var cmd = queue.shift();

            runningTasks++;
            this.emit('startedTask', cmd);
            exec(cmd, execOptions, _.partial(taskDone, cmd));
        }
    }

    /**
     * Decrement the running tasks and start the next one
     */
    function taskDone (err, stdout, stderr) {
        runningTasks--;
        this.emit('finishedTask', err, stdout, stderr);

        if (queue.length > 0) {
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
