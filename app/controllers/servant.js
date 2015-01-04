// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    request = require('request'),
    Config = require('../../config/config'),
    StripeHelper = require('../stripe_helper');

// Instantiate SDKs
if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') var Servant = require('servant-sdk-node')({ application_client_id: process.env.SERVANT_CLIENT_ID, application_client_secret: process.env.SERVANT_SECRET_KEY });
else var Servant = require('servant-sdk-node')({ application_client_id: Config.servant.client_id, application_client_secret: Config.servant.client_secret });

/**
 * Servant Connect Callback
 *
 * - Handles Initial Authorization
 * - Also used as the "Log in" function
 * - Fetches User Profile From Servant
 * - Saves User To Database
 */
var servantConnectCallback = function(req, res) {
    var self = this;

    // Helper method updates user in database each time they connect
    self._saveUser = function(tokens, newUser, callback) {
        // Get User & Servants
        Servant.getUserAndServants(tokens.access_token, function(error, response) {
            if (error) return callback(error, null);
            // Find Servant User In Database
            User.findOne({
                 servant_user_id: response.user._id
            }).exec(function(error, user) {
                if (error) return callback(error, null);
                // Set Properties
                var servant_user = response.user;
                if (!user) user = new User();
                user.full_name = servant_user.full_name;
                user.nick_name = servant_user.nick_name;
                user.email     = servant_user.email;
                user.servant_user_id = servant_user._id;
                user.servant_access_token = tokens.access_token;
                user.servant_access_token_limited = tokens.access_token_limited;
                user.servant_refresh_token = tokens.refresh_token;
                user.updated = new Date();
                user.last_signed_in = new Date();
                // Save
                user.save(function(error, user) {
                    // Callback
                    return callback(error, user);
                });      
            });
        }); // Servant.getUserAndServants
    }; // _saveUser()

    // If AuthorizationCode was included in the parameters, the user hasn't authorized. Exchange AuthCode For Tokens
    if (req.query.code) {
        Servant.exchangeAuthCode(req.query.code, function(error, servant_tokens) {            
            if (error) return res.status(500).json({ error: error });
            self._saveUser(servant_tokens, true, function(error, user) {
                if (error) return res.status(500).json({ error: error });
                // Save Session
                req.session = {
                    user: user
                };
                return res.redirect('/');
            });
        }); // Servant Authentication Callback
    }
    // If RefreshToken was included in the parameters, the User has already authenticated
    if (req.query.refresh_token) {
        self._saveUser(req.query, false, function(error, user) {
            if (error) return res.status(500).json({ error: error });
            // Save Session
            req.session = {
                user: user
            }; 
            return res.redirect('/');
        });
    }
    // Otherwise Throw Error
    if (!req.query.code && !req.query.refresh_token) return res.status(500).json({ error: 'Something went wrong with connecting to this user' });
}; // authenticationCallback

// Servant Webhooks Callback
var servantWebhooksCallback = function(req, res) {
    console.log("WEBHOOK: ", req.body);
    // Respond to Servant with status 200
    res.json({ status: 'Webhook Received'});
};

// Refresh AccessToken - Example showing how to refresh AccessTokens
// var refreshAccessToken = function(refresh_token, callback) {
//     
// });



module.exports = {
    servantConnectCallback: servantConnectCallback,
    servantWebhooksCallback: servantWebhooksCallback
};