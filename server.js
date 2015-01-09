// Module Dependencies
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');

// Set Environment from ENV variable or default to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load Local Environment Variables
if (env === 'development') {
    var dotenv = require('dotenv');
    dotenv.load();
}

// Load Config
var config = require('./config/config');

// Set Port
var port = process.env.PORT || config.app.port;

// Connect MongoDB Database 
if (env === 'development') mongoose.connect(config.db);
if (env === 'production') mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connection.on('error', function(err) {
    console.log('Mongoose Connection Error: ' + err);
});

// Bootstrap Models
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// CookieParser should be above session
app.use(cookieParser());

// Express Cookie-Based Session
app.use(session({
    name: 'iekoocNAEMETALPRELIOBTNAVRES',
    secret: 'NAEMETALPRELIOBTNAVRES',
    secureProxy: false, // Set to true if you have an SSL Certificate
    cookie: {
        secure: false, // Secure is Recommeneded, However it requires an HTTPS enabled website (SSL Certificate)
        maxAge: 864000000 // 10 Days in miliseconds
    }
}));

// Favicon
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// Set Jade as the template engine
app.set('views', './app/views');
app.set('view engine', 'jade');

// Get req.body as JSON when receiving POST requests
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({
    extended: true
})); // parse application/x-www-form-urlencoded

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);
console.log('****** Servant Boilerplate ' + env + ' is now running on port ' + port + '  ******'); // shoutout to the user
exports = module.exports = app; // expose app

// Start TaskRunner Timer
var TaskRunner = setInterval(function() {
    var taskRunner = require('./app/task_runner');
    return taskRunner.run();
}, 180000);


// End