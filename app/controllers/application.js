
// Module dependencies.
var Servant = require('servant-sdk').Servant,
	config = require('../../config/config');

// Instantiate Servant SDK depending on development environment
if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
	var servant = new Servant(config.servant.client_key, config.servant.client_secret, 'Enter Your Production Callback URL Here', 'v1');
} else {
	var servant = new Servant(config.servant.client_key, config.servant.client_secret, 'http://localhost:8080/auth/servant/callback', 'v1');
}

var home = function(req, res) {
	res.render('home', {connect_url: config.servant.connect_url});
};

var dashboard = function(req, res) {
	res.render('dashboard');
};

var callback = function(req, res) {
	servant.getAccessToken(req, function(error, tokens) {
		console.log(error, tokens);
		// Add Only The Client Token
		res.redirect('/');
	});
};

module.exports = {
	home: home,
	dashboard: dashboard,
	callback: callback
};