// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    TwilioHelper = require('../twilio_helper'),
    Config = require('../../config/config');

var twilioIncomingSMS = function(req, res, next) {
    console.log("WEBHOOK FROM TWILIO: ", req.body, req.query, req.params)
};

module.exports = {
    twilioIncomingSMS: twilioIncomingSMS
};