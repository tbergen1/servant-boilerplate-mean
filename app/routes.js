module.exports = function(app) {

	// Application Routes
	var middleware = require('../app/controllers/middleware');
	var application = require('../app/controllers/application');
	var servant = require('../app/controllers/servant');
	var user = require('../app/controllers/user');

	// Servant
	app.get('/servant/callback', servant.servantConnectCallback);
	app.post('/servant/webhooks', servant.servantWebhooksCallback);

	// User
	app.get('/logout', middleware.checkSession, user.logout);
	app.get('/user', middleware.checkSession, user.showUser);
	app.post('/user/update_card', middleware.checkSession, user.updatePaymentCard);
	app.put('/user/update_plan', middleware.checkSession, user.updatePlan);

	// Application
	app.get('/', application.index);

};