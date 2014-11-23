module.exports = function(app) {

	// Application Routes
	var application = require('../app/controllers/application');

	app.get('/servant/callback', application.authenticationCallback)
	app.get('/logout', application.logout);
	app.get('/', application.index);

};