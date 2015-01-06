// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ServantMeta = mongoose.model('ServantMeta'),
    ScheduledTask = mongoose.model('ScheduledTask'),
    TwilioHelper = require('../twilio_helper'),
    config = require('../../config/config');


// Check if session exists
var checkSession = function(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            error: "Unauthorized User"
        });
    } else {
        User.find({
            _id: req.session.user._id
        }).limit(1).exec(function(error, users) {
            if (error) return res.status(500).json({
                error: error
            });
            if (!users[0]) {
                // Destroy The Session, And Redirect
                req.session = null;
                return res.status(401).json({
                    error: "Unauthorized"
                });
            }
            req.user = users[0];
            return next();
        });
    }
};

// Check If User Owns Servant
var authorizeServant = function(req, res, next) {
    ServantMeta.find({
        servant_id: req.params.servantID,
        user: req.user._id
    }).limit(1).exec(function(error, servantmetas) {
        if (error) return res.status(500).json({
            error: error
        });
        if (!servantmetas.length) return res.status(404).json({
            error: "Servant Not Found"
        });
        req.servantmeta = servantmetas[0];
        return next();
    });
};

// Check For Twilio Subaccount.  Create If Missing
var checkTwilioSubaccount = function(req, res, next) {
    if (req.servantmeta.twilio_subaccount_id && req.servantmeta.twilio_subaccount_auth_token) {
        return next();
    } else {
        TwilioHelper.createSubaccount(req.params.servantID, function(error, response) {
            if (error) return res.status(500).json({
                error: error
            });
            // Add Subaccount To Servant
            req.servantmeta.twilio_owner_account_id = response.owner_account_sid;
            req.servantmeta.twilio_subaccount_id = response.sid;
            req.servantmeta.twilio_subaccount_auth_token = response.auth_token;
            // Save Servant
            req.servantmeta.save(function(error, servant) {
                if (error) return res.status(500).json({
                    error: error
                });
                req.servantmeta = servant;
                return next();
            });
        });
    }
};

module.exports = {
    checkSession: checkSession,
    authorizeServant: authorizeServant,
    checkTwilioSubaccount: checkTwilioSubaccount
};