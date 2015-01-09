// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ServantMeta = mongoose.model('ServantMeta'),
    TwilioHelper = require('../twilio_helper'),
    Config = require('../../config/config');

// Instantiate ServantSDK
var ServantSDK = require('servant-sdk-node')({
    application_client_id: process.env.SERVANT_CLIENT_ID,
    application_client_secret: process.env.SERVANT_SECRET_KEY
});


var twilioIncomingSMS = function(req, res, next) {
    console.log("WEBHOOK FROM TWILIO: ", req.body, req.query, req.params);

    ServantMeta.find({
        twilio_phone_number: req.body.To
    }).limit(1).populate('user').exec(function(error, servantmetas) {
        if (error) console.log("Webhook Error (Twilio) - Finding ServantMeta: ", error);
        var servantmeta = servantmetas[0];
        if (servantmeta) {
            // Process Keyword


            // Query Contacts to see if user exists
            var criteria = {
                query: {
                    'phone_numbers.phone_number': req.body.From
                },
                sort: {},
                page: 1
            };
            console.log(criteria.query['phone_numbers.phone_number']['$in']);
            ServantSDK.queryArchetypes(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', criteria, function(error, response) {
                console.log(error, response);
                if (error) return console.log(error);
                if (response.records.length) {
                    return true;
                } else {

                    // Create Contact
                    var newContact = {
                        phone_numbers: [{
                            phone_number_name: "Mobile",
                            phone_number: req.body.From.replace('+1', '')
                        }]
                    }
                    ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', newContact, function(error, contact) {
                        if (error) console.log(error);
                        console.log(contact);
                    });
                }
            });
        }
    });


    res.json({
        message: "thanks"
    });
};

module.exports = {
    twilioIncomingSMS: twilioIncomingSMS
};