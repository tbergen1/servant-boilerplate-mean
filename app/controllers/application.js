// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    request = require('request'),
    config = require('../../config/config');

// Instantiate Servant SDK
if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    var Servant = require('servant-sdk-node')({ application_client_id: process.env.SERVANT_CLIENT_ID, application_client_secret: process.env.SERVANT_SECRET_KEY });
} else {
    var Servant = require('servant-sdk-node')({ application_client_id: config.servant.client_id, application_client_secret: config.servant.client_secret });
}

/**
 * Render Either Home Page or Dashboard Page Depending On User Session
 */
var index = function(req, res) {
    // Variables to pass into the views using Jade templates
    var variables = {
        connect_url: config.servant.connect_url,
        client_id: config.servant.client_id,
        name: config.app.name,
        description: config.app.description,
        keywords: config.app.keywords,
        environment: process.env.NODE_ENV
    };
    variables.access_token = req.session.servant !== undefined ? req.session.servant.access_token : undefined;
    variables.access_token_limited = req.session.servant !== undefined ? req.session.servant.access_token_limited : undefined;

    if (req.session.servant && req.session.servant.user_id) res.render('dashboard', variables);
    else res.render('home', variables);
};

/**
 * Log Out User
 */
var logout = function(req, res) {
    // Destroy The Session, And Redirect
    req.session = null;
    res.redirect('/');
};

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
    self._saveUser = function(tokens, callback) {
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
                    return callback(error, user);
                });      
            });
        }); // Servant.getUserAndServants
    }; // _saveUser()

    // If AuthorizationCode was included in the parameters, the user hasn't authorized. Exchange AuthCode For Tokens
    if (req.query.code) {
        Servant.exchangeAuthCode(req.query.code, function(error, servant_tokens) {
            if (error) res.status(500).json({ error: error });
            self._saveUser(servant_tokens, function(error, user) {
                if (error) res.status(500).json({ error: error });
                // Save Session
                req.session.servant = {
                    user_id: user._id,
                    access_token: user.servant_access_token,
                    access_token_limited: user.servant_access_token_limited
                }; 
                return res.redirect('/');
            });
        }); // Servant Authentication Callback
    }
    // If RefreshToken was included in the parameters, the User has already authenticated
    if (req.query.refresh_token) {
        self._saveUser(req.query, function(error, user) {
            if (error) res.status(500).json({ error: error });
            // Save Session
            req.session.servant = {
                user_id: user._id,
                access_token: user.servant_access_token,
                access_token_limited: user.servant_access_token_limited
            }; 
            return res.redirect('/');
        });
    }
    // Otherwise Throw Error
    if (!req.query.code && !req.query.refresh_token) return res.status(500).json({ error: 'Something went wrong with connecting to this user' });
}; // authenticationCallback

/**
 * Servant Webhooks Callback
 */
var servantWebhooksCallback = function(req, res) {
    console.log(req.body);
    // Respond to Servant with status 200
    res.json({ status: 'Webhook Received'});
};

/**
 * Refresh AccessToken - Example showing how to refresh AccessTokens
 */

// Servant.refreshAccessToken(user.servant_refresh_token, function(error, tokens) {
//     console.log(errors, tokens)
// });


module.exports = {
    index: index,
    logout: logout,
    servantConnectCallback: servantConnectCallback,
    servantWebhooksCallback: servantWebhooksCallback
};
