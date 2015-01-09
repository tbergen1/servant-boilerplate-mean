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


var checkTagExists = function(servantmeta, callback) {
    if (servantmeta.default_tag_id) return callback(null);

    // See If Tag Exists On Servant
    var criteria = {
        query: {
            'tag': 'text-marketing-list'
        },
        sort: {},
        page: 1
    };
    ServantSDK.queryArchetypes(servantmeta.user.servant_access_token, servantmeta.servant_id, 'tag', criteria, function(error, response) {
        if (error) return console.log("Tag Creation Error: ", error);
        if (response.records.length) {
            // Add Tag To ServantMeta
            servantmeta.default_tag_id = response.records[0]._id;
            servantmeta.save(function(error, response) {
                return callback(response);
            });
        } else {
            // Create Tag
            ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'tag', {
                tag: 'text-marketing-list'
            }, function(error, tag) {
                if (error) return console.log("Tag Creation Error: ", error);
                // Add Tag To ServantMeta
                servantmeta.default_tag_id = tag._id;
                servantmeta.save(function(error, response) {
                    if (error) return console.log("Tag Save Error: ", error);
                    return callback(response);
                });
            });
        }
    });

};

var twilioIncomingSMS = function(req, res, next) {
    console.log("WEBHOOK – Twilio: ", req.body.Body, req.body.From, req.body.To);

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
                    'phone_numbers.phone_number': req.body.From.replace('+1', '')
                },
                sort: {},
                page: 1
            };
            ServantSDK.queryArchetypes(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', criteria, function(error, response) {
                if (error) return console.log(error);
                if (response.records.length) {
                    return true;
                } else {

                    // Check Tag Exists
                    checkTagExists(servantmeta, function(servantmeta) {

                        // Create Contact
                        var newContact = {
                            phone_numbers: [{
                                phone_number_name: "Mobile",
                                phone_number: req.body.From.replace('+1', '')
                            }],
                            tags: [servantmeta.default_tag_id]
                        }
                        ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', newContact, function(error, contact) {
                            if (error) console.log("Contact Creation Error: ", error);
                        });
                    });
                }
            });
        }
    });

    // Respond With Blank Twiml
    TwilioHelper.createTwiml(function(twiml) {
        res.writeHead(200, {
            'Content-Type': 'text/xml'
        });
        res.end(twiml.toString());
    });
};

module.exports = {
    twilioIncomingSMS: twilioIncomingSMS
};

