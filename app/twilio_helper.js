// Module dependencies.
var mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    ServantMeta = mongoose.model('ServantMeta'),
    Config = require('../config/config');

// Instantiate  Twilio w/ Master Account
var twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

var createSubaccount = function(servantID, callback) {
    // Create Subaccount
    twilio.accounts.create({
        friendlyName: servantID
    }).then(function(numbers) {
        return callback(null, numbers);
    }, function(error) {
        return callback(error, null);
    });
};

var closeSubaccount = function(accountSID, callback) {
    // Close Subaccount
    twilio.accounts(accountSID).update({
        status: "closed"
    }, function(error, account) {
        return callback(error, account);
    });
};

var closeAllInactiveSubaccounts = function() {
    // List All Active Subaccounts
    twilio.accounts.get({
        Status: 'active'
    }, function(error, data) {
        if (error) console.log("Error Retrieving Open Subaccounts:", error);
        // Iterate Through Each Subaccount
        async.eachSeries(data.accounts, function(account, accountCallback) {
            // Check If Master Account
            if (account.friendly_name.indexOf("austen") > -1) return accountCallback();
            // Check if ServantMeta Exists
            ServantMeta.findOne({
                servant_id: account.friendly_name
            }).exec(function(error, servantmeta) {
                if (error) console.log(error);
                if (servantmeta) {
                    return accountCallback();
                } else {
                    closeSubaccount(account.sid, function(error, account) {
                        if (error) console.log("Error Closing Subaccount:", error);
                        return accountCallback();
                    });
                }
            });
        }, function() {
            console.log("Inactive SubAccounts Closed")
        })
    });
};

var searchLocalPhoneNumbers = function(country, area_code, callback) {
    if (!country) country = 'US';
    if (!area_code) area_code = '418';
    area_code = area_code.toString();
    twilio.availablePhoneNumbers(country).local.get({
        areaCode: area_code
    }).then(function(numbers) {
        return callback(null, numbers);
    }, function(error) {
        console.log(error)
        return callback(error, null);
    });
};

var searchTollFreePhoneNumbers = function(country, callback) {
    // Close Subaccount
    if (!country) country = 'US';
    twilio.availablePhoneNumbers(country).tollFree.get().then(function(numbers) {
        return callback(null, numbers);
    }, function(error) {
        return callback(error, null);
    });
};

var purchasePhoneNumber = function(servantmeta, number, callback) {
    twilio.incomingPhoneNumbers.create({
        smsUrl: "http://texter.servant.co/webhooks/twilio/sms/incoming",
        smsMethod: "POST",
        phoneNumber: number
    }).then(function(number) {
        console.log(number)
        return callback(null, number);
    }, function(error) {
        console.log(error)
        return callback(error, null);
    });
};

var releasePhoneNumber = function(servantmeta, callback) {
    twilio.incomingPhoneNumbers(servantmeta.twilio_phone_number_sid).delete(function(error, response) {
        if (error) {
            return callback(error, null);
        } else {
            return callback(null, response);
        }
    });
};

var textBlast = function(toNumber, fromNumber, body, callback) {
    // Send Text
    twilio.messages.create({
        body: body,
        to: toNumber,
        from: fromNumber
    });
    if (callback) return callback(null);
};


module.exports = {
    createSubaccount: createSubaccount,
    closeSubaccount: closeSubaccount,
    searchLocalPhoneNumbers: searchLocalPhoneNumbers,
    searchTollFreePhoneNumbers: searchTollFreePhoneNumbers,
    purchasePhoneNumber: purchasePhoneNumber,
    releasePhoneNumber: releasePhoneNumber,
    textBlast: textBlast
};




// End