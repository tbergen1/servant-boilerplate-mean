// Module dependencies.
var mongoose = require('mongoose'),
    moment = require('moment'),
    ScheduledTask = mongoose.model('ScheduledTask'),
    Config = require('../config/config');

var run = function() {
    // Log Time
    console.log("TaskRunner Running: ", moment().format("h:mm a MM-DD-YYYY Z"));
    // Find Tasks
    ScheduledTask.find({
        scheduled_time: moment().startOf('hour').toDate()
    }).exec(function(error, tasks) {
        return console.log(error, tasks);
    });
};

module.exports = {
    run: run
};