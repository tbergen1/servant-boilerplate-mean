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
    campaign: {
        type: String
    },
    servant_id: {
        type: String,
        required: true
    },
    tinytext_id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'queued'
    },
    page: {
        type: Number,
        default: 1
    },
    error: {
        type: String
    },
    user: {
        type: Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('ScheduledTask', ScheduledTaskSchema);