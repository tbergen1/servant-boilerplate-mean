



// Initialize The SDK
var options = {
    application_client_id: "none",
    token: $('#dashboard-container').data('accesstokenlimited'),
    protocol: 'http',
    image_dropzone_class: 'image-dropzone'
}
Servant.initialize(options, function(status) {
	// Create Angular App
	angular.module('appDashboard', ['ngResource', 'ui.router', 'ui.bootstrap']);

	// Universal Functions & Data
	angular.module('appDashboard').run(['$rootScope', '$timeout', '$interval',
		function($rootScope, $timeout, $interval) {

			// Defaults
			$rootScope.servant = {};

		}
	]);    
}); // Servant.initialize


