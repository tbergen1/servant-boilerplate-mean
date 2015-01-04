	
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

		// Watch State Change
		$rootScope.$on('$stateChangeSuccess', 
		function(event, toState, toParams, fromState, fromParams){ 
		    if (toState.name !== fromState.name) {
		    	$rootScope.s.state = toState.name;
		    }
		});

	}
]);    


