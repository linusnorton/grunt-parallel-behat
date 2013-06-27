
var exec = require('child_process').exec;

module.exports = function (maxTasks, execOptions) {
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
        runningTasks++;
        var cmd = queue.shift();
        exec(cmd, options, _.partial(taskDone, cmd));
    }

    /**
     * Decrement the running tasks and start the next one
     */
    function taskDone () {
        runningTasks--;
        this.emit('taskComplete', arguments);

        if (!isFinished()) {
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

    /**
     * Returns true if the queue is empty
     *
     * @return {Boolean}
     */
    function isFinished() {
        return queue.length === 0;
    }

    this.start = start;
    this.addTask = addTask;
    this.isFinished = isFinished;

    return this;
}