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

        // Load User & Servant Data From Servant And Combine It With Local User & Servant Data
        $rootScope.s.loadUserAndServantDataFromServant = function(callback) {
            ServantAngularService.getUserAndServants().then(function(response) {
                // Combine Servants and ServantMeta
                for (i = 0; i < $rootScope.s.user.servants.length; i++) {
                    for (j = 0; j < response.servants.length; j++) {
                        if ($rootScope.s.user.servants[i].servant_id === response.servants[j]._id) {
                            delete response.servants[j]._id; // Delete Or Will Overwrite ServantMeta ID
                            angular.extend($rootScope.s.user.servants[i], response.servants[j]);
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
            if ($rootScope.s.user.servants[$rootScope.servant_index].servant_pay.subscription_status === 'none') return callback('no_subscription');
            if (!$rootScope.s.user.servants[$rootScope.servant_index].twilio_phone_number) return callback('no_number');
            return callback(null);
        };

        // Show Modal
        $rootScope.s.showModal = function(view) {
            // Show Modal Overlay & Box
            document.getElementById("modal-overlay").style.display = 'block';
            document.getElementById("modal-box").style.display = 'block';
            // Change View Back
            $rootScope.view = view;
        };

        // Hide Modal
        $rootScope.s.hideModal = function() {
            // Show Modal Overlay & Box
            document.getElementById("modal-overlay").style.display = 'none';
            document.getElementById("modal-box").style.display = 'none';
            // Change View Back
            $rootScope.view = 'dashboard';
        };


    }
]);