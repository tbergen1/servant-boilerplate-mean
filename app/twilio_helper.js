// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Config = require('../config/config');

// Configure Twilio
var twilio = require('twilio')('AC209467e0970d6e80e48aa77f6f93629e', '053064089c8379721577000b4c960801');

var searchPhoneNumbers = function(callback) {
	console.log("here");
	twilio.availablePhoneNumbers('US').local.get(function(error, numbers) {
		console.log(error, numbers)
		if (callback) return callback(error, numbers);
	});;
};


var textBlast = function(number, body, callback) {
	
};


module.exports = {
    searchPhoneNumbers: searchPhoneNumbers
};