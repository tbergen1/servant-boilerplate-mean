// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Config = require('../../config/config');


var getPhoneNumbers = function() {

};

var updatePhoneNumber = function() {

};

var textBlast = function(req, res, next) {

	// Pull in Tiny Text From Specific Servant
	// Loop through Contacts and text each one w/ Phone Number
	
}


module.exports = {
    getPhoneNumbers: getPhoneNumbers,
    updatePhoneNumber: updatePhoneNumber,
    textBlast: textBlast
};