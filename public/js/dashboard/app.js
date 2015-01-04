	
// Create Angular App
angular.module('appDashboard', ['ngResource', 'ui.router']);

// Universal Functions & Data
angular.module('appDashboard').run(['$rootScope', '$timeout', '$interval',
	function($rootScope, $timeout, $interval) {

		// Defaults
		$rootScope.s = {
			loading:false,
			tinytext: null,
			tinytexts: []
		};

	}
]);    


