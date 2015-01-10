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

// Handle Incoming SMS
var incomingSMS = function(req, res, next) {
    // Prepare Twiml Response
    TwilioHelper.createTwiml(function(twiml) {
        req.twiml = twiml;
        res.writeHead(200, {
            'Content-Type': 'text/xml'
        });

        // Handle Webhook Events
        if (req.body.Body.toLowerCase().trim() === 'stop') {
            // Stop Event 
            return handleStopEvent(req, res, next);
        } else {
            // Start Event
            return handleStartEvent(req, res, next);
        } // TODO – Handle Keywords and Campaigns
    });
};

// Handle Start Event – Add New Or Previous Subscriber
var handleStartEvent = function(req, res, next) {
    // Find ServantMeta
    ServantMeta.find({
        twilio_phone_number: req.body.To
    }).limit(1).populate('user').exec(function(error, servantmetas) {
        if (error) {
            console.log("Webhook Error (Twilio) - Finding ServantMeta: ", error);
            return res.end(req.twiml.toString());
        }
        // If No ServantMeta, Return
        var servantmeta = servantmetas[0];
        if (!servantmeta) return res.end(req.twiml.toString());

        // Query Contacts To See If Contact Exists Already
        var criteria = {
            query: {
                'phone_numbers.phone_number': req.body.From.replace('+1', '')
            },
            sort: {},
            page: 1
        };
        ServantSDK.queryArchetypes(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', criteria, function(error, response) {
            if (error) {
                console.log("Webhook Error (Twilio) - Finding Contact On Servant: ", error);
                return res.end(req.twiml.toString());
            }
            // Update Existing Contact, Or Create New One
            if (response.records.length) {
                // Update Existing Contact – Update Contact's Tags To Active
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
                    if (error) console.log("Webhook Error (Twilio) - Adding Contact Active Tag Failed: ", error);
                });
                // Increment SMS Sent Number
                Helpers.incrementSMS(servantmeta);
                // Respond With New Subscriber Message
                req.twiml.message('Thanks for subscribing! Message and data rates may apply. Reply HELP for help. Reply STOP to cancel. Enjoy!');
                return res.end(req.twiml.toString());
            } else {
                // Create New Contact.  First Check Active And Inactive Tags Exist...
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
                        if (error) {
                            console.log("Webhook Error (Twilio) - Saving Contact On Servant: ", error);
                            return res.end(req.twiml.toString());
                        }
                        // Increment SMS Sent Number
                        Helpers.incrementSMS(servantmeta);
                        // Respond With New Subscriber Message
                        req.twiml.message('Thanks for subscribing! Message and data rates may apply. Reply HELP for help. Reply STOP to cancel. Enjoy!');
                        return res.end(req.twiml.toString());
                    });
                });
            }
        });
    });
};

// Handle Stop Event – Remove Subscriber
var handleStopEvent = function(req, res, next) {
    // Find ServantMeta
    ServantMeta.find({
        twilio_phone_number: req.body.To
    }).limit(1).populate('user').exec(function(error, servantmetas) {
        if (error) {
            console.log("Webhook Error (Twilio) - Finding ServantMeta: ", error);
            return res.end(req.twiml.toString());
        }
        // If No ServantMeta, Return
        var servantmeta = servantmetas[0];
        if (!servantmeta) return res.end(req.twiml.toString());

        // Query Contacts To See If Contact Exists
        var criteria = {
            query: {
                'phone_numbers.phone_number': req.body.From.replace('+1', ''),
                'tags': servantmeta.active_tag_id
            },
            sort: {},
            page: 1
        };
        ServantSDK.queryArchetypes(servantmeta.user.servant_access_token, servantmeta.servant_id, 'contact', criteria, function(error, response) {
            if (error) {
                console.log("Webhook Error (Twilio) - Finding Contact On Servant: ", error);
                return res.end(req.twiml.toString());
            }
            // If No Contact, Do Nothing
            if (!response.records.length) return res.end(req.twiml.toString());
            // If Contact Exists, Remove Active Tag And Add Inactive Tag
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
            // Return Twiml
            return res.end(req.twiml.toString());
        });
    });
};


// Check Tags Exists – Servant Texter Uses Two Tags.  Make Sure They Exists Before Adding/Removing Contacts
var checkTagsExist = function(servantmeta, callback) {
    // If ServantMeta Has Tag, Return
    if (servantmeta.active_tag_id && servantmeta.inactive_tag_id) return callback(servantmeta);

    // Define Helper Functions
    var createActiveTag = function(activeCallback) {
        // Check If Active Tag Exists Or Create One
        var criteria = {
            query: {
                'tag': 'text-marketing-active'
            },
            sort: {},
            page: 1
        };
        ServantSDK.queryArchetypes(servantmeta.user.servant_access_token, servantmeta.servant_id, 'tag', criteria, function(error, response) {
            if (error) return console.log("Active Tag Creation Error: ", error);
            if (response.records.length) {
                return activeCallback(response.records[0]._id);
            } else {
                // Create Tag
                ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'tag', {
                    tag: 'text-marketing-active'
                }, function(error, tag) {
                    if (error) return console.log("Active Tag Creation Error: ", error);
                    return activeCallback(tag._id);
                });
            }
        });
    };

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
                return inactiveCallback(response.records[0]._id);
            } else {
                // Create Tag
                ServantSDK.saveArchetype(servantmeta.user.servant_access_token, servantmeta.servant_id, 'tag', {
                    tag: 'text-marketing-inactive'
                }, function(error, tag) {
                    if (error) return console.log("Active Tag Creation Error: ", error);
                    return inactiveCallback(tag._id);
                });
            }
        });
    }

    // Check For Or Create Active and Inactive Tags
    createActiveTag(function(activeTagID) {
        createInactiveTag(function(inactiveTagID) {
            servantmeta.active_tag_id = activeTagID;
            servantmeta.inactive_tag_id = inactiveTagID;
            servantmeta.save(function(error, servantmeta) {
                if (error) return console.log("Active Tag Save Error: ", error);
                return callback(servantmeta);
            });
        });
    });
};

module.exports = {
    incomingSMS: incomingSMS
};