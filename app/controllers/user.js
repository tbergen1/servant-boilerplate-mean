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
var logout = function(req, res) {
    // Destroy The Session, And Redirect
    req.session = null;
    res.redirect('/');
};

// Show User
var showUser = function(req, res) {
    res.json(req.user);
};

// Update User Plan
var updatePlan = function(req, res, next) {
    // Check if the user is a Stripe customer
    if (!req.user.stripe_customer_id) return res.status(500).json({ error: 'User does not have a card on file' });
    
    // Update plan
    Stripe.customers.updateSubscription(
        req.user.stripe_customer_id,
        req.user.stripe_subscription_id, {
            plan: req.body.plan
        },
        function(error, subscription) {
        	console.log(error, subscription)
            if (error) return res.status(500).json({ error: error });
            req.user.plan = req.body.plan;
            req.user.save(function(error, user) {
            	if (error) return res.status(500).json({ error: error });
                res.json(user);
            });
        }
    );
};

// Save Stripe Card Token
var updatePaymentCard = function(req, res, next) {

    // Helper Function to create card, save user, and render
    var createCardAndRender = function() {
        Stripe.customers.createCard(
            req.user.stripe_customer_id, {
                card: req.body.id
            }, function(error, card) {
                if (error) return res.status(500).json({ error: error });
                if (!card) return res.status(500).json({ error: 'Stripe card creation error' });
                if (card) {
                    req.user.payment_status = 'valid';
                    req.user.stripe_card_last4 = card.last4;
                    req.user.stripe_card_brand = card.brand;
                    req.user.save(function(error, user) {
                        if (error) return res.status(500).json({ error: error });
                        return res.json(user);
                    });
                }
            }
        );
    };

    // List Customer's Cards
    Stripe.customers.listCards(req.user.stripe_customer_id, function(error, cards) {
        if (error) return res.status(500).json({ error: error });
        if (!cards.data.length) {
            //Customer has no cards on file
            createCardAndRender();
        } else if (cards.data.length > 0) {
            // Customer has cards on file.  Iterate through their cards.  Servant Texter only allows 1 card per customer, so delete them all, make way for the new card.
            async.eachSeries(cards.data, function(card, cardCallback) {
                Stripe.customers.deleteCard(
                    req.user.stripe_customer_id,
                    card.id,
                    function(error, confirmation) {
                        if (error || !confirmation) return res.status(500).json({ error: error });
                        cardCallback();
                    }
                );
            }, function() {
                // When all customer cards are deleted, make a new one
                createCardAndRender();
            }); // async
        }
    }); // Stripe.customers.listCards()
}; // addPaymentToken


module.exports = {
    logout: logout,
    showUser: showUser,
    updatePlan: updatePlan,
    updatePaymentCard: updatePaymentCard
};


