// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    request = require('request'),
    config = require('../../config/config');


// Check if session exists
var checkSession = function(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    } else {
        User.find({ _id: req.session.user._id }).limit(1).exec(function(error, users) {
            if (error) return res.status(500).json({ error: error });
            if (!users[0]) {
                // Destroy The Session, And Redirect
                req.session = null;
                res.redirect('/');
            }
            req.user = users[0];
            next();
        });
    }
};

module.exports = {
    checkSession: checkSession
};