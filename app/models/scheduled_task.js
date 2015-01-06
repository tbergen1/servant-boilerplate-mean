// Module dependencies.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// ScheduledTask Schema
var ScheduledTaskSchema = new Schema({
    scheduled_time: {
        type: Date,
        required: true
    },
    task: {
        type: String
    },
    servant_id: {
        type: String,
        required: true
    },
    page: {
        type: Number,
        default: 1
    },
    index: {
        type: Number,
        default: 0
    },
    initiated: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('ScheduledTask', ScheduledTaskSchema);