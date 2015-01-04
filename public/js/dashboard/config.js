// Resolves
var setupView = ['$q', '$rootScope', '$stateParams', 'Application', 'ServantAngularService',
    function($q, $rootScope, $stateParams, Application, ServantAngularService) {
        if (!$rootScope.s.user) {
            // If User is unauthorized, authorize them
            var deferred = $q.defer();
            Application.show_user(null, function(user) {
                $rootScope.s.user = user;
                console.log('User fetched: ', $rootScope.s.user);
                // Initialize The Servant SDK
				var options = {
				    application_client_id: "none",
				    token: $rootScope.s.user.servant_access_token_limited,
				    protocol: window.location.host.indexOf('localhost') > -1 ? 'http' : 'https',
				    image_dropzone_class: 'image-dropzone'
				}
				Servant.initialize(options);
                deferred.resolve();
            }, function(error) {
                if (error.status === 401) {
                    window.location = '/';
                    return false;
                }
            });
            return deferred.promise;
        } else {
            return true;
        }
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
					setupView: setupView
				}
			})
	}
]);

// Setting HTML5 Location Mode
angular.module('appDashboard').config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);