// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ServantMeta = mongoose.model('ServantMeta'),
    Helpers = require('../helpers'),
    TwilioHelper = require('../twilio_helper'),
    Config = require('../../config/config');

// Instantiate ServantSDK
var ServantSDK = require('servant-sdk-node')({
    application_client_id: process.env.SERVANT_CLIENT_ID,
    application_client_secret: process.env.SERVANT_SECRET_KEY
});


var twilioIncomingSMS = function(req, res, next) {
    console.log("WEBHOOK – Twilio: ", req.body.Body, req.body.From, req.body.To);

    // Handle Webhook Events
    if (req.body.Body.toLowerCase().trim() === 'stop') {
        // Stop Event 
        return handleStopEvent(req, res, next);
    } else {
        // Start Event
        return handleStartEvent(req, res, next);
    }
};

var handleStartEvent = function(req, res, next) {
    // Find ServantMeta
    ServantMeta.find({
        twilio_phone_number: req.body.To
    }).limit(1).populate('user').exec(function(error, servantmetas) {
        if (error) console.log("Webhook Error (Twilio) - Finding ServantMeta: ", error);
        var servantmeta = servantmetas[0];
        if (servantmeta) {
            // TODO – Process Keyword

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
                    // Contact Exists, Update Their Tags
                    var contact = response.records[0];
                    // Iterate Through Tags.  Remove Relevant Tags.  Add Single Active Tag.
                    for (i = 0; i < contact.tags.length; i++) {
                        // Remove All Inactive Tags
                        if (contact.tags[i] && contact.tags[i]._id.toString() === servantmeta.inactive_tag_id) contact.tags.splice(i, 1);
                        // Remove All Active Tags
                        if (contact.tags[i] && contact.tags[i]._id.toString() === servantmeta.active_tag_id) contact.tags.splice(i, 1);
                    }
                    // Add Single Active Tag
                    contact.tags.push(servantmeta.active_tag_id);
                    // Save Contact
                    ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', contact, function(error, contact) {
                        if (error) return console.log("Servant Error – Adding Contact Active Tag Failed! ", error);
                    });
                    // Respond With New Subscriber Message
                    TwilioHelper.createTwiml(function(twiml) {
                        // Increment SMS Sent Number
                        Helpers.incrementSMS(servantmeta);
                        // Send SMS
                        twiml.message('Thanks for subscribing! Message and data rates may apply. Reply HELP for help. Reply STOP to cancel. Enjoy!');
                        res.writeHead(200, {
                            'Content-Type': 'text/xml'
                        });
                        res.end(twiml.toString());
                    });
                } else {
                    // Check Tag Exists
                    checkTagsExist(servantmeta, function(servantmeta) {
                        // Create Contact
                        var newContact = {
                            phone_numbers: [{
                                phone_number_name: "Mobile",
                                phone_number: req.body.From.replace('+1', '')
                            }],
                            tags: [servantmeta.active_tag_id]
                        }
                        ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', newContact, function(error, contact) {
                            if (error) console.log("Contact Creation Error: ", error);
                            // Respond With New Subscriber Message
                            TwilioHelper.createTwiml(function(twiml) {
                                // Increment SMS Sent Number
                                Helpers.incrementSMS(servantmeta);
                                // Send SMS
                                twiml.message('Thanks for subscribing! Message and data rates may apply. Reply HELP for help. Reply STOP to cancel. Enjoy!');
                                res.writeHead(200, {
                                    'Content-Type': 'text/xml'
                                });
                                res.end(twiml.toString());
                            });
                        });
                    });
                }
            });
        }
    });
};

var handleStopEvent = function(req, res, next) {
    // Find ServantMeta
    ServantMeta.find({
        twilio_phone_number: req.body.To
    }).limit(1).populate('user').exec(function(error, servantmetas) {
        if (error) console.log("Webhook Error (Twilio) - Finding ServantMeta: ", error);
        var servantmeta = servantmetas[0];

        if (servantmeta) {
            // Find Contact
            var criteria = {
                query: {
                    'phone_numbers.phone_number': req.body.From.replace('+1', ''),
                    'tags': servantmeta.active_tag_id
                },
                sort: {},
                page: 1
            };
            ServantSDK.queryArchetypes(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', criteria, function(error, response) {
                if (error) return console.log(error);
                if (response.records.length) {
                    var contact = response.records[0];
                    // Iterate Through Tags.  Remove Relevant Tags.  Add Single Inactive Tag.
                    for (i = 0; i < contact.tags.length; i++) {
                        // Remove All Inactive Tags
                        if (contact.tags[i] && contact.tags[i]._id.toString() === servantmeta.inactive_tag_id) contact.tags.splice(i, 1);
                        // Remove All Active Tags
                        if (contact.tags[i] && contact.tags[i]._id.toString() === servantmeta.active_tag_id) contact.tags.splice(i, 1);
                    }
                    // Add Single Inactive Tag
                    contact.tags.push(servantmeta.inactive_tag_id);
                    // Save Contact
                    ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', contact, function(error, contact) {
                        if (error) return console.log("Servant Error – Removing Contact Inactive Tag Failed! ", error);
                    });
                } else {
                    // Contact Not Found
                    return console.log("Servant Error – Can't Find Contact Who Requested Stop.  Criteria: ", criteria.query);
                }
            });
        }
    });

    // Respond With No Twiml
    TwilioHelper.createTwiml(function(twiml) {
        res.writeHead(200, {
            'Content-Type': 'text/xml'
        });
        res.end(twiml.toString());
    });
};



var checkTagsExist = function(servantmeta, callback) {
    // If ServantMeta Has Tag, Return
    if (servantmeta.active_tag_id && servantmeta.inactive_tag_id) return callback(servantmeta);

    // Define Helper Functions
    var createActiveTag = function(activeCallback) {
        // ServantMeta Doesn't Have Active Tag.  First, Check If Tag Exists On Servant
        var criteria = {
            query: {
                'tag': 'text-marketing-active'
            },
            sort: {},
            page: 1
        };
        ServantSDK.queryArchetypes(servantmeta.user.servant_access_token, servantmeta.servant_id, 'tag', criteria, function(error, response) {
            if (error) return console.log("Tag Creation Error: ", error);
            if (response.records.length) {
                servantmeta.active_tag_id = response.records[0]._id;
                servantmeta.save(function(error, servantmeta) {
                    if (error) return console.log("Active Tag Save Error: ", error);
                    return activeCallback(servantmeta);
                });
            } else {
                // Create Tag
                ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'tag', {
                    tag: 'text-marketing-active'
                }, function(error, tag) {
                    if (error) return console.log("Active Tag Creation Error: ", error);
                    // Add Tag To ServantMeta
                    servantmeta.active_tag_id = tag._id;
                    servantmeta.save(function(error, servantmeta) {
                        if (error) return console.log("Active Tag Save Error: ", error);
                        return activeCallback(servantmeta);
                    });
                });
            }
        });
    }
    var createInactiveTag = function(inactiveCallback) {
        // ServantMeta Doesn't Have Active Tag.  First, Check If Tag Exists On Servant
        var criteria = {
            query: {
                'tag': 'text-marketing-inactive'
            },
            sort: {},
            page: 1
        };
        ServantSDK.queryArchetypes(servantmeta.user.servant_access_token, servantmeta.servant_id, 'tag', criteria, function(error, response) {
            if (error) return console.log("Tag Creation Error: ", error);
            if (response.records.length) {
                servantmeta.inactive_tag_id = response.records[0]._id;
                servantmeta.save(function(error, servantmeta) {
                    if (error) return console.log("Inactive Tag Save Error: ", error);
                    return inactiveCallback(servantmeta);
                });
            } else {
                // Create Tag
                ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'tag', {
                    tag: 'text-marketing-inactive'
                }, function(error, tag) {
                    if (error) return console.log("Inactive Tag Creation Error: ", error);
                    // Add Tag To ServantMeta
                    servantmeta.inactive_tag_id = tag._id;
                    servantmeta.save(function(error, servantmeta) {
                        if (error) return console.log("Inactive Tag Save Error: ", error);
                        return inactiveCallback(servantmeta);
                    });
                });
            }
        });
    }

    // Check And Create Both Active and Inactive Tags
    createActiveTag(function(servantmeta) {
        createInactiveTag(function(servantmeta) {
            return callback(servantmeta);
        });
    });
};

module.exports = {
    twilioIncomingSMS: twilioIncomingSMS
};