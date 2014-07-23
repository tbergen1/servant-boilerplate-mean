// Module dependencies.
var Servant = require('servant-sdk').Servant,
	config = require('../../config/config');

// Instantiate Servant SDK depending on development environment
if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
	var servant = new Servant(config.servant.client_key, config.servant.client_secret, 'Enter Your Production Callback URL Here', 'v1');
} else {
	var servant = new Servant(config.servant.client_key, config.servant.client_secret, 'http://localhost:8080/auth/servant/callback', 'v1');
}

// Render Either Home Page or Dashboard Page If User is Logged In
var index = function(req, res) {
	// Variables to pass into the views
	var variables = {
		connect_url: config.servant.connect_url,
		name: config.app.name,
		description: config.app.description,
		keywords: config.app.keywords,
		token: req.session.client_token || undefined
	};

	if (req.session.user) {
		res.render('dashboard', variables);
	} else {
		res.render('home', variables);
	}
};

// Log Out User & Redirect
var logout = function(req, res) {
	// Destroy The Session, And Redirect
	req.session.destroy(function(err) {
		res.redirect('/');
	});
};

// Handle Servant Authentication Callback
var callback = function(req, res) {
	// Get Access Token via Seravnt-SDK
	servant.getAccessToken(req, function(error, tokens) {
		if (error) {
			console.log(error);
			return res.json(error);
		}

		// Create/Update User Record To Database Here (if you want)

		// Otherwise, Save User Data & API Tokens To Session (SSL Certificate Is Recommened For Production + Set Session Secure to 'true' in Server.js)
		req.session.regenerate(function(err) {
			req.session.user = tokens.user_id;
			req.session.access_token = tokens.access_token;
			req.session.client_token = tokens.client_token;
			res.redirect('/');
		});
	});
};

module.exports = {
	index: index,
	logout: logout,
	callback: callback
};