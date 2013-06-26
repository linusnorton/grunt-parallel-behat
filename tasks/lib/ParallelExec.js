
var exec = require('child_process').exec;

module.exports = function (maxTasks, execOptions) {
    var running = false,
        queue = [],
        runningTasks = 0;

    function addTask (cmd) {
        queue.push(cmd);

        if (running && runningTasks < maxTasks) {
            startNextTask();
        }
    }

    function startNextTask () {
        runningTasks++;
        cmd = queue.pop();

        exec(cmd, options, taskDone);
    }

    function taskDone () {
        runningTasks--;

        this.emit('taskComplete', arguments);

        startNextTask();
    }

    function start () {
        running = true;

        startNextTask();
    }

    this.startTask = startTask();

    return this;
}