module.exports = function(app) {

	// Application Routes
	var application = require('../app/controllers/application');

	app.get('/auth/servant/callback', application.callback)
	app.get('/dashboard', application.dashboard);
	app.get('/', application.home);

};