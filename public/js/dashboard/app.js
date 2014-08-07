// Detect Development Environment On Client-Side, in case you need to know
var environment = $('#dashboard-container').attr('data-dashboard');
if (environment === 'development') { console.log('Environment: Development'); }

// Create Angular App
angular.module('appDashboard', ['ngResource', 'ui.router', 'ui.bootstrap', 'LocalStorageModule']);

// Universal Functions & Data
angular.module('appDashboard').run(['$rootScope', '$timeout', '$interval',
	function($rootScope, $timeout, $interval) {

		// Defaults
		$rootScope.servant = {};

		// Fetch Token
		$rootScope.servant.token = $('#dashboard-container').attr('data-token');


	}
]);