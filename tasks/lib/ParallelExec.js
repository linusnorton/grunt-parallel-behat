
var exec = require('child_process').exec,
    _ = require('underscore'),
    EventEmitter = require('events').EventEmitter;

module.exports = function (maxTasks, execOptions) {
    var running = false,
        queue = [],
        runningTasks = 0;

    // inherit from event emitter
    EventEmitter.call(this);

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
            runningTasks++;
            var cmd = queue.shift();
            exec(cmd, execOptions, _.partial(taskDone, cmd));
        }
    }

    /**
     * Decrement the running tasks and start the next one
     */
    function taskDone () {
        runningTasks--;
        this.emit('taskComplete', arguments);

        if (queue.length > 0) {
            startNextTask();
        }
    }

    /**
     * Start the tasks running
     */
    function start () {
        running = true;

        _.times(maxTasks - runningTasks, startNextTask);
    }

    this.start = start;
    this.addTask = addTask;

    return this;
}