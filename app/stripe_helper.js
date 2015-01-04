// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Config = require('../config/config');

// Instantiate Stripe SDK
if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') var Stripe = require('stripe')(Config.stripe.test_secret_key);
else var Stripe = require('stripe')(Config.stripe.test_secret_key);

var createStripeCustomer = function(userID, callback) {
	Stripe.customers.create({
        plan: 'free',
        metadata: {
            texter_user_id: userID
        }
    }, function(error, customer) {
        return callback(error, customer);
    });
};

var updatePlan = function(stripeCustomerID, stripeSubscriptionID, plan, callback) {
	Stripe.customers.updateSubscription(
        stripeCustomerID,
        stripeSubscriptionID, {
            plan: plan
        },
        function(error, subscription) {
        	return callback(error, subscription);
        }
    );
};

module.exports = {
    createStripeCustomer: createStripeCustomer,
    updatePlan: updatePlan
};