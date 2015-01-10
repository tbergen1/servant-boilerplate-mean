// Module dependencies.
var mongoose = require('mongoose'),
    moment = require('moment'),
    async = require('async'),
    ServantMeta = mongoose.model('ServantMeta'),
    ScheduledTask = mongoose.model('ScheduledTask'),
    Helpers = require('./helpers'),
    TwilioHelper = require('./twilio_helper'),
    Config = require('../config/config');

// Instantiate ServantSDK
var ServantSDK = require('servant-sdk-node')({
    application_client_id: process.env.SERVANT_CLIENT_ID,
    application_client_secret: process.env.SERVANT_SECRET_KEY
});

// Plan Limits
var plan_limits = {
    plan1: 500,
    plan2: 1000,
    plan3: 1500,
    plan4: 2000,
    plan5: 2500,
    test: 400
};

// Blast Contacts
var blastContacts = function(plan, servantmeta, tinytextBody, access_token, servantID, page, callback) {
    // Query 10 Contacts At A Time w/ Active Tag
    var criteria = {
        query: {
            'tags': servantmeta.active_tag_id
        },
        sort: {
            created: -1
        },
        page: page
    };

    ServantSDK.queryArchetypes(access_token, servantID, 'contact', criteria, function(error, response) {
        console.log(error);
        if (error) return callback('servant_api_error', page);
        if (response.records.length) {
            try {
                // Check Plan
                if (servantmeta.sms_sent > plan_limits[servantmeta.plan]) return callback('hit_sms_limit', page + 1);
                // Text Each Contact
                for (i = 0; i < response.records.length; i++) {
                    if (!response.records[i].phone_numbers.length) continue;
                    // Perform Text Blast
                    TwilioHelper.textBlast(response.records[i].phone_numbers[0].phone_number, servantmeta.twilio_phone_number, tinytextBody);
                    // Increment SMS Sent Number
                    Helpers.incrementSMS(servantmeta);
                    // Manually Increment SMS Number
                    servantmeta.sms_sent = servantmeta.sms_sent + 1;
                };
                // Recurse, If More Pages Of Contacts
                return blastContacts(plan, servantmeta, tinytextBody, access_token, servantID, page + 1, callback);
            } catch (e) {
                console.log("Text Blast Error:", e);
                return callback('unknownerror_blastcontacts', page);
            }
        } else {
            // Finished
            return callback(null);
        }
    });
};


var run = function() {
    // Log Time
    var taskrunner_time = moment().format("h:mm:ss a MM-DD-YYYY Z");
    console.log("TaskRunner Started: ", taskrunner_time);
    // Find Tasks
    var populateQuery = [{
        path: 'user',
        select: 'servant_access_token email'
    }];
    ScheduledTask.find({
        status: 'queued',
        scheduled_time: {
            $lt: new Date()
        }
    }).populate(populateQuery).exec(function(error, tasks) {

        // Execute Each Scheduled Task Synchronisely 
        async.eachSeries(tasks, function(task, taskCallback) {

            // Fetch ServantMeta
            ServantMeta.find({
                servant_id: task.servant_id
            }).limit(1).exec(function(error, servantmetas) {
                if (error) {
                    task.status = 'error';
                    task.error = 'servantmeta_missing';
                    task.save();
                    return taskCallback();
                }
                var servantmeta = servantmetas[0];

                // Update Month If Necessary
                if (servantmeta.month !== moment().format('MM-YYYY')) {
                    servantmeta.month = moment().format('MM-YYYY');
                    servantmeta.sms_sent = 0;
                    servantmeta.save();
                }

                // Check Servant For Plan Information
                ServantSDK.showServant(task.user.servant_access_token, task.servant_id, function(error, servant) {
                    if (error) {
                        task.status = 'error';
                        task.error = 'error_fetching_servant';
                        task.save();
                        return taskCallback();
                    }
                    // Fetch Selected Tiny Text Record
                    ServantSDK.showArchetype(task.user.servant_access_token, task.servant_id, 'tinytext', task.tinytext_id, function(error, tinytext) {
                        // Fetch Contacts
                        blastContacts(servant.servant_pay_subscription_plan_id, servantmeta, tinytext.body, task.user.servant_access_token, task.servant_id, task.page, function(error, error_page) {
                            if (error && error_page) {
                                task.status = 'error';
                                task.error = error;
                                task.page = error_page + 1;
                                task.save();
                                return taskCallback();
                            } else {
                                task.status = 'complete';
                                task.save();
                                return taskCallback();
                            }
                        });
                    });
                });
            });
        }, function() {
            console.log("TaskRunner Finished: " + taskrunner_time + " – " + moment().format("h:mm:ss a MM-DD-YYYY Z"));
        });
    });
};

// TODO – Email Notification On Error
var notifyServantOwner = function(user) {

};

module.exports = {
    run: run
};