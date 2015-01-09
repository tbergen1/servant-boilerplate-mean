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

    }
]);