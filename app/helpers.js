// Module dependencies.
var mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    ServantMeta = mongoose.model('ServantMeta'),
    Config = require('../config/config');

var incrementSMS = function(servantmeta) {
    // Increment SMS Sent Number
    ServantMeta.update({
        _id: servantmeta._id
    }, {
        $inc: {
            sms_sent: 1
        }
    }, {
        multi: false
    }, function(error, response) {
        console.log("Increment SMS Error: ",error);
    });
};

module.exports = {
    incrementSMS: incrementSMS
};




// End