// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Config = require('../config/config');


var createSubaccount = function(servantID, callback) {
    // Set-Up Twilio w/ Master Account
    var twilio = require('twilio')('AC209467e0970d6e80e48aa77f6f93629e', '053064089c8379721577000b4c960801');
    // Create Subaccount
    twilio.accounts.create({
        friendlyName: servantID
    }).then(function(numbers) {
        return callback(null, numbers);
    }, function(error) {
        return callback(error, null);
    });
};

var closeSubaccount = function(accountID, callback) {
    // Set-Up Twilio w/ Master Account
    var twilio = require('twilio')('AC209467e0970d6e80e48aa77f6f93629e', '053064089c8379721577000b4c960801');
    // Close Subaccount
    twilio.accounts(accountID).update({
        status: "closed"
    }, function(err, account) {
        console.log(err, account)
    });
};


var searchLocalPhoneNumbers = function(country, area_code, callback) {
    // Set-Up Twilio w/ Master Account
    var twilio = require('twilio')('AC209467e0970d6e80e48aa77f6f93629e', '053064089c8379721577000b4c960801');
    // Close Subaccount
    if (!country) country = 'US';
    if (!area_code) area_code = '418';
    area_code = area_code.toString();
    twilio.availablePhoneNumbers(country).local.get({
        areaCode: area_code
    }).then(function(numbers) {
        return callback(null, numbers);
    }, function(error) {
        return callback(error, null);
    });
};

var searchTollFreePhoneNumbers = function(country, callback) {
    // Set-Up Twilio w/ Master Account
    var twilio = require('twilio')('AC209467e0970d6e80e48aa77f6f93629e', '053064089c8379721577000b4c960801');
    // Close Subaccount
    if (!country) country = 'US';
    twilio.availablePhoneNumbers(country).tollFree.get().then(function(numbers) {
        return callback(null, numbers);
    }, function(error) {
        return callback(error, null);
    });
};

var purchasePhoneNumber = function(number, callback) {
    // Set-Up Twilio w/ SubAccount
    var twilio = require('twilio')(req.servant.twilio_subaccount_id, req.servant.twilio_subaccount_auth_token);
    // Close Subaccount
    if (!country) country = 'US';
    if (!area_code) area_code = '418';
    area_code = area_code.toString();
    twilio.availablePhoneNumbers(country).local.get({
        areaCode: area_code
    }).then(function(numbers) {
        return callback(null, numbers);
    }, function(error) {
        return callback(error, null);
    });
};


var textBlast = function(number, body, callback) {

};


module.exports = {
    createSubaccount: createSubaccount,
    closeSubaccount: closeSubaccount,
    searchLocalPhoneNumbers: searchLocalPhoneNumbers,
    searchTollFreePhoneNumbers: searchTollFreePhoneNumbers
};