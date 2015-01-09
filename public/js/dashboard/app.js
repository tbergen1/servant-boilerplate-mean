// Create Angular App
angular.module('appDashboard', ['ngResource', 'ui.router']);

// Universal Functions & Defaults
angular.module('appDashboard').run(['$rootScope', '$timeout', '$interval', '$state', 'ServantAngularService', 'Application',
    function($rootScope, $timeout, $interval, $state, ServantAngularService, Application) {

        // Defaults
        $rootScope.s = {};

        // State Change Error Handler
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            // console.log(event, toState, toParams, fromState, fromParams, error);
            $rootScope.s.loading = false;
            switch (error) {
                case "no_subscription":
                    return $state.go('plan', toParams);
                case "no_number":
                    return $state.go('number', toParams);
                default:
                    return $state.go('servants');
            }
        });

        // Universal Functions

        // Initialize Servant SDK
        $rootScope.s.initializeServantSDK = function(callback) {
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
        $rootScope.s.loadUserAndServantDataFromApp = function(callback) {
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

        // Load User & Servant Data From Servant
        $rootScope.s.loadUserAndServantDataFromServant = function(callback) {
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

        // Load All User & Servant Data
        $rootScope.s.reloadUserAndServantData = function(callback) {
            $rootScope.s.loadUserAndServantDataFromApp(function(error, response) {
                if (error) return callback(error, null);
                $rootScope.s.loadUserAndServantDataFromServant(function(error, response) {
                    if (error) return callback(error, null);
                    if (callback) return callback(null, $rootScope.s.user);
                })
            });
        };

        // Set Active Servant
        $rootScope.s.setServant = function(servantID, callback) {
            for (i = 0; i < $rootScope.s.user.servants.length; i++) {
                if ($rootScope.s.user.servants[i].servant_id.toString() === servantID) $rootScope.servant_index = i;
            }
            ServantAngularService.setServant($rootScope.s.user.servants[$rootScope.servant_index].servant_id);
            return callback();
        };

        // Authorize View
        $rootScope.s.authorizeView = function(callback) {
            // Check For Subscription & Number
            if ($rootScope.s.user.servants[$rootScope.servant_index].servant_pay_subscription_status === 'none') return callback('no_subscription');
            if (!$rootScope.s.user.servants[$rootScope.servant_index].twilio_phone_number) return callback('no_number');
            return callback(null);
        };


    }
]);