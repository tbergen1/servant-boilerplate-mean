// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    request = require('request'),
    async = require('async'),
    Config = require('../../config/config'),
    StripeHelper = require('../stripe_helper');

// Instantiate SDKs
if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    var Stripe = require('stripe')(Config.stripe.test_secret_key);
} else {
    var Stripe = require('stripe')(Config.stripe.test_secret_key);
}

// Log Out User
var logout = function(req, res, next) {
    // Destroy The Session, And Redirect
    req.session = null;
    return res.redirect('/');
};

// Show User
var showUser = function(req, res, next) {
    res.json(req.user);
};

module.exports = {
    logout: logout,
    showUser: showUser
};


