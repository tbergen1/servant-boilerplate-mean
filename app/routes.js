module.exports = function(app) {
	
	// Application Routes
    var application = require('../app/controllers/application');
    
	app.get('/', application.home);

};