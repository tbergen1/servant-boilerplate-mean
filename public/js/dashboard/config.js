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

        // Initialize Servant SDK
        var initializeServantSDK = function(callback) {
            var options = {
                application_client_id: "none",
                token: $rootScope.s.user.servant_access_token_limited,
                protocol: window.location.host.indexOf('localhost') > -1 ? 'http' : 'https',
                image_dropzone_class: 'image-dropzone'
            };
            Servant.initialize(options, function() {
                return callback();
            });
        };

        // Load User & Servant Data From Local Application
        var loadUserAndServantDataFromApp = function(callback) {
            Application.show_user(null, function(user) {
                $rootScope.s.user = user;
                console.log("User And Servants Fetched: ", $rootScope.s.user);
                return callback(null, $rootScope.s.user);
            }, function(error) {
                if (error.status === 401) {
                    window.location = '/';
                    return false;
                }
                return callback(error, null);
            });
        };

        var loadUserAndServantDataFromServant = function(callback) {
            ServantAngularService.getUserAndServants().then(function(response) {
                // Combine Servants and ServantMeta
                for (i = 0; i < $rootScope.s.user.servants.length; i++) {
                    for (j = 0; j < response.servants.length; j++) {
                        if ($rootScope.s.user.servants[i].servant_id === response.servants[j]._id) {
                            $rootScope.s.user.servants[i].master = response.servants[j].master;
                            $rootScope.s.user.servants[i].master_biography = response.servants[j].master_biography;
                            $rootScope.s.user.servants[i].personality = response.servants[j].personality;
                            $rootScope.s.user.servants[i].servant_pay_subscription_status = response.servants[j].servant_pay_subscription_status;
                            $rootScope.s.user.servants[i].servant_pay_subscription_plan_canceled = response.servants[j].servant_pay_subscription_plan_canceled;
                            $rootScope.s.user.servants[i].servant_pay_subscription_plan_id = response.servants[j].servant_pay_subscription_plan_id;
                        }
                    };
                };
                if (callback) return callback();
            }, function(error) {
                console.log(error);
            });
        };

        // Set Active Servant
        var setServant = function(servantID, callback) {
            for (i = 0; i < $rootScope.s.user.servants.length; i++) {
                if ($rootScope.s.user.servants[i].servant_id.toString() === servantID) $rootScope.servant_index = i;
            }
            ServantAngularService.setServant($rootScope.s.user.servants[$rootScope.servant_index].servant_id);
            return callback();
        };

        // Authorize View
        var authorizeView = function(callback) {
            // Check For Subscription & Number
            if ($rootScope.s.user.servants[$rootScope.servant_index].servant_pay_subscription_status === 'none') return callback('no_subscription');
            if (!$rootScope.s.user.servants[$rootScope.servant_index].twilio_phone_number) return callback('no_number');
            return callback(null);
        };

        // Handle View
        if (!$rootScope.s.user) {
            var deferView = $q.defer();
            $rootScope.s.loading = true;
            loadUserAndServantDataFromApp(function() {
                initializeServantSDK(function() {
                    loadUserAndServantDataFromServant(function() {
                        if ($stateParams.servantID) {
                            setServant($stateParams.servantID, function() {
                                authorizeView(function(error) {
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
            setServant($stateParams.servantID, function() {
                authorizeView(function(error) {
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