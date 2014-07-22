'use strict';

// Module dependencies.

var Servant    = require('servant-sdk').Servant;
var production = true;

if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
	var servant = new Servant('client_tZql5PhG0n9UGgqH', 'secret_k4rrst9m97KK3i2wA2Lo4zpde5tAyxne', 'http://showcase-servantapp.herokuapp.com/auth/servant/callback', 'v1');
} else {
	// Showcase Development - Servant Production
	// var servant = new Servant('client_tZql5PhG0n9UGgqH', 'secret_k4rrst9m97KK3i2wA2Lo4zpde5tAyxne', 'http://localhost:3000/auth/servant/callback', 'v1');
	// Showcase Development - Servant Develpment
	var servant = new Servant('client_TGR5njDGddHolod5', 'secret_wnxIfNdEDPcuzvRejDDJgLLspSLWzTGw', 'http://localhost:3000/auth/servant/callback', 'v1');
};

var home = function(req, res) {
	res.render('home');
};

var stage = function(req, res, token) {
	res.render('stage');
};

var callback = function(req, res) {
	servant.getAccessToken(req, function(error, tokens) {
		// Add Only The Client Token
		res.redirect('/stage/#!/products?client_token=' + tokens.client_token);
	});
};

module.exports = {
    home:           home,
    stage:          stage,
    callback:       callback
}