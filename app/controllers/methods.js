// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    TwilioHelper = require('../twilio_helper'),
    Config = require('../../config/config');


var searchPhoneNumbers = function(req, res, next) {
	console.log("hereehrehr")
	TwilioHelper.searchPhoneNumbers(function(error, numbers) {
		if (error) return res.status(500).send(error);
		return res.send(numbers);
	});
};

var searchPhoneNumbers = function() {

};

var updatePhoneNumber = function() {

};

var textBlast = function(req, res, next) {

	// Pull in Tiny Text From Specific Servant
	// Loop through Contacts and text each one w/ Phone Number
	
}


module.exports = {
    searchPhoneNumbers: searchPhoneNumbers
};