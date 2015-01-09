// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ServantMeta = mongoose.model('ServantMeta'),
    ScheduledTask = mongoose.model('ScheduledTask'),
    TwilioHelper = require('../twilio_helper'),
    Config = require('../../config/config');


var index = function(req, res) {
    // Render Either Home Page or Dashboard Page Depending On User Session
    var variables = {
        connect_url: Config.servant.connect_url,
        client_id: Config.servant.client_id,
        name: Config.app.name,
        description: Config.app.description,
        keywords: Config.app.keywords,
        environment: process.env.NODE_ENV
    };

    if (req.session.user) res.render('dashboard', variables);
    else res.render('home', variables);
};

var logOut = function(req, res, next) {
    // Destroy The Session, And Redirect
    req.session = null;
    return res.redirect('/');
};

var showUser = function(req, res, next) {
    // Add Servants To User
    ServantMeta.find({
        user: req.user._id
    }).exec(function(error, servantmetas) {
        if (error) return res.status(500).json({
            error: error
        });
        req.user = req.user.toObject();
        req.user.servants = servantmetas;
        res.json(req.user);
    });
};

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
    TwilioHelper.purchasePhoneNumber(req.body.phone_number, function(error, number) {
        console.log(error, number);
        if (error) return res.status(400).json({
            error: error
        });
        req.servantmeta.twilio_phone_number_sid = number.sid;
        req.servantmeta.twilio_phone_number = number.phone_number;
        req.servantmeta.save(function(error, servant) {
            console.log(error, servant);
            if (error) return res.status(500).json({
                error: error
            });
            return res.json(servant);
        });
    });
};

var scheduleTask = function(req, res, next) {
    var task = new ScheduledTask({
        scheduled_time: req.body.scheduled_time,
        task: req.body.task,
        servant_id: req.servantmeta.servant_id,
        tinytext_id: req.body.tinytextID,
        user: req.user._id
    });
    task.save(function(error, task) {
        if (error) return res.status(500).json({
            error: error
        });
        return res.json(task);
    });
};


module.exports = {
    index: index,
    logOut: logOut,
    showUser: showUser,
    searchPhoneNumbers: searchPhoneNumbers,
    purchasePhoneNumber: purchasePhoneNumber,
    scheduleTask: scheduleTask
};