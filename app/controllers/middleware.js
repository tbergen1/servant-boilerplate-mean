// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    request = require('request'),
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
                return res.redirect('/');
            }
            req.user = users[0];
            return next();
        });
    }
};

// Check If User Owns Servant
var authorizeServant = function(req, res, next) {
    for (i = 0; i < req.user.servants.length; i++) {
        if (req.user.servants[i].servant_id === req.params.servantID) req.servant = req.user.servants[i];
    };
    if (!req.servant) return res.status(401).json({
        error: "Unauthorized Servant"
    });
    return next();
};

// Check For Twilio Subaccount.  Create If Missing
var checkTwilioSubaccount = function(req, res, next) {
    if (req.servant.twilio_subaccount_id && req.servant.twilio_subaccount_auth_token) {
        return next();
    } else {
        TwilioHelper.createSubaccount(req.params.servantID, function(error, response) {
            if (error) return res.status(500).json({
                error: error
            });
            // Add Subaccount to User's Servant
            req.user.servants[servant].twilio_owner_account_id = response.owner_account_sid;
            req.user.servants[servant].twilio_subaccount_id = response.sid;
            req.user.servants[servant].twilio_subaccount_auth_token = response.auth_token;
            // Save User
            req.user.markModified('servants');
            req.user.save(function(error, user) {
                if (error) return res.status(500).json({
                    error: error
                });
                req.user = user;
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