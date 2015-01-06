module.exports = function(app) {

    // Application Routes
    var middleware = require('../app/controllers/middleware');
    var application = require('../app/controllers/application');
    var servant = require('../app/controllers/servant');
    var webhooks = require('../app/controllers/webhooks');

    // Servant
    app.get('/servant/callback', servant.servantConnectCallback);
    app.post('/servant/webhooks', servant.servantWebhooksCallback);

    // User
    app.get('/logout', middleware.checkSession, application.logOut);
    app.get('/user', middleware.checkSession, application.showUser);

    // Operations
    app.post('/schedule/sms_blast', application.scheduleSMSBlast);

    // Twilio
    app.post('/servants/:servantID/twilio/phone_numbers/search', middleware.checkSession, middleware.authorizeServant, middleware.checkTwilioSubaccount, application.searchPhoneNumbers);
    app.post('/servants/:servantID/twilio/phone_numbers/purchase', middleware.checkSession, middleware.authorizeServant, middleware.checkTwilioSubaccount, application.purchasePhoneNumber);

    // Webhooks
    app.get('/webhooks/twilio/sms/incoming', webhooks.twilioIncomingSMS);

    // Application
    app.get('/', application.index);

};