// Module dependencies.
var Servant = require('servant-sdk').Servant,
	config = require('../../config/config');

// Instantiate Servant SDK depending on development environment
if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
	var servant = new Servant(config.servant.client_key, config.servant.client_secret, 'Enter Your Production Callback URL Here', 'v1');
} else {
	var servant = new Servant(config.servant.client_key, config.servant.client_secret, 'http://localhost:8080/auth/servant/callback', 'v1');
}


var index = function(req, res) {
	// Variables to pass into the views
	var variables = {
		connect_url: config.servant.connect_url,
		name: config.app.name,
		description: config.app.description,
		keywords: config.app.keywords
	};

	console.log("Session Loaded: ", req.session)
	if (req.session.user) {
		console.log("Dashboard Rendered");
		res.render('dashboard', variables);
	} else {
		console.log("Home Rendered");
		res.render('home', variables);
	}
};

var logout = function(req, res) {
	// If Using Sessions, Destroy The Session
	req.session.destroy(function(err) {
		res.redirect('/');
	});
};

var callback = function(req, res) {
	servant.getAccessToken(req, function(error, tokens) {
		if (error) {
			console.log(error);
			return res.json(error);
		}

		// Save User Record To Database Here (if you want)

		// Otherwise, Save User Data & API Tokens To Session (SSL Certificate Is Recommened For Production + Set Session Secure to 'true' in Server.js)
		req.session.regenerate(function(err) {
			req.session.user = tokens.user_id;
			req.session.access_token = tokens.access_token;
			req.session.client_token = tokens.client_token;
			console.log("session: ", req.session);
			res.redirect('/');
		})
	});
};

module.exports = {
	index: index,
	logout: logout,
	callback: callback
};