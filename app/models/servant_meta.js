// Module dependencies.
var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

// ServantMeta Schema
var ServantMetaSchema = new Schema({
    servant_id: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    default_tag_id: {
        type: String,
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    month: {
        type: String,
        default: moment().format('MM-YYYY'),
        trim: true
    },
    sms_sent: {
        type: Number
    },
    twilio_owner_account_id: {
        type: String,
        trim: true
    },
    twilio_subaccount_id: {
        type: String,
        trim: true
    },
    twilio_subaccount_auth_token: {
        type: String,
        trim: true
    },
    twilio_phone_number_sid: {
        type: String,
        trim: true
    },
    twilio_phone_number: {
        type: String,
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    last_connected: {
        type: Date
    }
});

mongoose.model('ServantMeta', ServantMetaSchema);