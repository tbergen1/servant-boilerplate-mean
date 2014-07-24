// Module Dependencies
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');

// Set Environment from ENV variable or default to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./config/config');

// Set Port
var port = process.env.PORT || config.app.port;

// Connect to our MongoDB Database 
// mongoose.connect(config.db);

// Express Session
app.use(session({
	secret: 'NAEMETALPRELIOBTNAVRES',
	resave: true,
	saveUninitialized: true,
	cookie: {
		secure: false, // Secure is Recommeneded, However it requires an HTTPS enabled website (SSL Certificate)
		maxAge: 259200000 // 3 Days in Miliseconds
	}
}));

// Get req.body as JSON when receiving POST requests
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({
	type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({
	extended: true
})); // parse application/x-www-form-urlencoded

// Serve Favicon
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// Set Jade as the template engine
app.set('views', './app/views');
app.set('view engine', 'jade');

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);
console.log('****** Servant Boilerplate is now running on port ' + port + ' ******'); // shoutout to the user
exports = module.exports = app; // expose app