// Module dependencies.
var mongoose = require('mongoose'),
    Config = require('../../config/config');

// Render Either Home Page or Dashboard Page Depending On User Session
var index = function(req, res) {
    
    var variables = {
        connect_url: Config.servant.connect_url,
        client_id: Config.servant.client_id,
        name: Config.app.name,
        description: Config.app.description,
        keywords: Config.app.keywords,
        environment: process.env.NODE_ENV
    };

    if (req.session.user) res.render('dashboard', variables);
    else res.render('home', variables);
};

module.exports = {
    index: index
};
