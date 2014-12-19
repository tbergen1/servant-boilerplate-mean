// Resolves
var checkSubscription = ['$q', '$rootScope', '$stateParams', 'Users', 'ServantAngularService',
    function($q, $rootScope, $stateParams, Users, ServantAngularService) {

    	console.log("here")
    	// Get Subscription Data Element
    	console.log( $('#dashboard-container').data('stripesubscription') )

    	// If User is unauthorized, authorize them
        // var deferred = $q.defer();
        // deferred.resolve();
        return true;


    }
];



// Angular Router
angular.module('appDashboard').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// For any unmatched url, redirect to '/'
		$urlRouterProvider.otherwise('/');
		// Now set up the states
		$stateProvider
			.state('dashboard', {
				url: '/',
				templateUrl: 'views/dashboard/dashboard.html',
				resolve: {
                    checkSubscription: checkSubscription
                }
			})
			.state('subscription', {
				url: '/subscription',
				templateUrl: 'views/dashboard/subscription.html'
			})
			.state('number', {
				url: '/number',
				templateUrl: 'views/dashboard/number.html'
			});
	}
]);

// Setting HTML5 Location Mode
angular.module('appDashboard').config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);