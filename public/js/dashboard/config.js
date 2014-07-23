// Angular Router
angular.module('appDashboard').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// For any unmatched url, redirect to '/'
		$urlRouterProvider.otherwise('/');
		// Now set up the states
		$stateProvider
			.state('dashboard', {
				url: '/',
				templateUrl: 'views/dashboard/dashboard.html'
			});
	}
]);

// Setting HTML5 Location Mode
angular.module('appDashboard').config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);