// Application Router
angular.module('appDashboard').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // For any unmatched url, redirect to '/'
        $urlRouterProvider.otherwise('/');
        // Now set up the states
        $stateProvider
            .state('servants', {
                url: '/',
                templateUrl: 'views/dashboard/servants.html',
                resolve: {
                    setupView: setupView
                }
            })
            .state('plan', {
                url: '/:servantID/plan',
                templateUrl: 'views/dashboard/plan.html',
                resolve: {
                    setupView: setupView
                }
            })
            .state('number', {
                url: '/:servantID/number',
                templateUrl: 'views/dashboard/number.html',
                resolve: {
                    setupView: setupView
                }
            })
            .state('menu', {
                url: '/:servantID/menu',
                templateUrl: 'views/dashboard/menu.html',
                resolve: {
                    setupView: setupView
                }
            })
            .state('blast', {
                url: '/:servantID/blast',
                templateUrl: 'views/dashboard/blast.html',
                resolve: {
                    setupView: setupView
                }
            })
    }
]);

// Resolves – setupView: Run necessary functions before loading any views
var setupView = ['$q', '$rootScope', '$state', '$stateParams', 'Application', 'ServantAngularService',
    function($q, $rootScope, $state, $stateParams, Application, ServantAngularService) {

        // Defaults
        var state = this;

        // Handle View
        if (!$rootScope.s.user) {
            var deferView = $q.defer();
            $rootScope.s.loading = true;
            $rootScope.s.loadUserAndServantDataFromApp(function() {
                $rootScope.s.initializeServantSDK(function() {
                    $rootScope.s.loadUserAndServantDataFromServant(function() {
                        if ($stateParams.servantID) {
                            $rootScope.s.setServant($stateParams.servantID, function() {
                                $rootScope.s.authorizeView(function(error) {
                                    if (error) return deferView.reject(error);
                                    $rootScope.s.loading = false;
                                    return deferView.resolve();
                                });
                            });
                        } else {
                            $rootScope.s.loading = false;
                            return deferView.resolve();
                        }
                    });
                });
            });
            return deferView.promise;
        } else if ($stateParams.servantID && ['menu', 'blast'].indexOf(state.self.name) > -1) {
            var deferView = $q.defer();
            $rootScope.s.loading = true;
            $rootScope.s.setServant($stateParams.servantID, function() {
                $rootScope.s.authorizeView(function(error) {
                    if (error) return deferView.reject(error);
                    $rootScope.s.loading = false;
                    return deferView.resolve();
                });
            });
            return deferView.promise;
        } else {
            return true;
        }
    }
];


// Setting HTML5 Location Mode
angular.module('appDashboard').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);