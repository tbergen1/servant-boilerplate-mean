module.exports = function(app) {

	// Application Routes
	var application = require('../app/controllers/application');

	app.get('/servant/callback', application.servantConnectCallback);
	app.post('/servant/webhooks', application.servantWebhooksCallback);
	app.get('/logout', application.logout);
	app.get('/', application.index);

};