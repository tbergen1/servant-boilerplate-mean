module.exports = function(app) {

    // Application Routes
    var middleware = require('../app/controllers/middleware');
    var application = require('../app/controllers/application');
    var servant = require('../app/controllers/servant');
    var webhooks_twilio = require('../app/controllers/webhooks_twilio');

    // Servant
    app.get('/servant/callback', servant.servantConnectCallback);
    app.post('/servant/webhooks', servant.servantWebhooksCallback);

    // User
    app.get('/logout', middleware.checkSession, application.logOut);
    app.get('/user', middleware.checkSession, application.showUser);

    // Operations
    app.post('/servants/:servantID/schedule/task', middleware.checkSession, middleware.authorizeServant, application.scheduleTask);

    // Twilio
    app.post('/servants/:servantID/twilio/phone_numbers/search', middleware.checkSession, middleware.authorizeServant, application.searchPhoneNumbers);
    app.post('/servants/:servantID/twilio/phone_numbers/purchase', middleware.checkSession, middleware.authorizeServant, application.purchasePhoneNumber);
    app.get('/servants/:servantID/twilio/phone_numbers/release', middleware.checkSession, middleware.authorizeServant, application.releasePhoneNumber);

    // Webhooks
    app.post('/webhooks/twilio/sms/incoming', webhooks_twilio.incomingSMS);

    // Application
    app.get('/', application.index);

};