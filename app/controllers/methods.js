// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    TwilioHelper = require('../twilio_helper'),
    Config = require('../../config/config');

var searchPhoneNumbers = function(req, res, next) {
    if (req.body.number_type === 'local') {
        TwilioHelper.searchLocalPhoneNumbers(req.body.country, req.body.area_code, function(error, numbers) {
            if (error) return res.status(400).json({
                error: error
            });
            return res.json(numbers);
        });
    } else if (req.body.number_type === 'tollfree') {
        TwilioHelper.searchTollFreePhoneNumbers(req.body.country, function(error, numbers) {
            if (error) return res.status(400).json({
                error: error
            });
            return res.json(numbers);
        });
    } else {
        if (error) return res.status(400).json({
            error: 'Please include a number_type'
        });
    }
};

var purchasePhoneNumber = function(req, res, next) {
    TwilioHelper.purchasePhoneNumber(req.body.country, req.body.area_code, function(error, numbers) {
        if (error) return res.status(400).json({
            error: error
        });
        return res.json(numbers);
    });
};


module.exports = {
    searchPhoneNumbers: searchPhoneNumbers,
    purchasePhoneNumber: purchasePhoneNumber
};